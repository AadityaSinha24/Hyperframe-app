import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { renderVideo } from './renderer.js';
import mongoose from 'mongoose';
import { Video } from './models/Video.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/videngenai')
    .then(() => console.log('🍃 MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

const SYSTEM_PROMPT = 'You are a Hyperframes Video Engineer. Generate video compositions using the Hyperframes HTML framework.\n\n═══ ROOT ELEMENT ═══\nThe root element MUST have data-start="0":\n<div data-composition-id="vid" data-start="0" data-width="1920" data-height="1080" data-duration="10" style="position:relative; width:1920px; height:1080px; background:#000; overflow:hidden;">\n  ... clips ...\n</div>\n\n═══ CLIPS (TIMED ELEMENTS) ═══\nEvery timed element MUST:\n1. Have class="clip"\n2. Have a unique id\n3. Have data-start and data-duration (in seconds)\n4. Have data-track-index (layering, 0=bottom)\n\nGSAP RULES:\n- NEVER use repeat: -1. Use finite counts.\n- NEVER animate transform properties (x, y, scale) directly on elements that have CSS transform.\n- ALWAYS use fromTo for predictable animations.\n- EXIT ANIMATIONS: Always add a hard-kill at the exact end. Example: tl.set("#text", { opacity: 0, visibility: "hidden" }, ">");\n\n═══ BACKGROUND IMAGE LIBRARY ═══\nUse these REAL URLs for <img> backgrounds:\n- Nature (Mountain): https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80\n- Nature (Ocean): https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1920&q=80\n- Tech: https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80\n\n═══ MEDIA RULES ═══\n1. NO INVENTED VIDEOS: Never use <video> tags with guessed filenames.\n2. BACKGROUNDS: Use <img> with LIBRARY URLs or CSS gradients.\n3. ATTRIBUTES: Every <img> MUST have: id, class="clip", src, data-start, data-duration.\n\n═══ STYLING ═══\n- Default to CSS gradients if no library image fits.\n- Use position:absolute for all elements within root.\n\nReturn ONLY HTML. No markdown, no explanation.';

async function validateComposition(html) {
    if (!html || typeof html !== 'string') return { valid: false, error: 'Invalid HTML' };
    if (!html.includes('data-composition-id') || !html.includes('data-duration')) {
        return { valid: false, error: 'Missing required data-attributes' };
    }
    // Official linter is currently buggy on this Windows machine (throws "Not a directory").
    // We rely on the basic structural check for now.
    return { valid: true };
}

async function generateWithRetry({ message, composition, chatHistory = [], maxRetries = 2 }) {
    let lastOutput = '';
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
            for (const msg of chatHistory) {
                if (msg.role === 'user') messages.push({ role: 'user', content: msg.content });
                else if (msg.role === 'assistant' && msg.content.includes('data-composition-id')) messages.push({ role: 'assistant', content: msg.content });
            }
            let userContent = '';
            if (attempt === 0) {
                if (composition) {
                    userContent = 'MODIFY this composition based on request: ' + message + '\n\nCURRENT HTML:\n' + composition;
                } else {
                    userContent = 'CREATE new composition for: ' + message;
                }
            } else {
                userContent = 'FIX LINT ERRORS:\n' + lastOutput + '\n\nReturn ONLY the fixed HTML.';
            }
            messages.push({ role: 'user', content: userContent });
            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.2
            });
            console.log('🤖 AI Response received (Attempt ' + attempt + ')');
            let output = completion.choices[0].message.content.trim();
            
            // Extract HTML if AI includes extra text
            const divStart = output.indexOf('<div');
            const scriptEnd = output.lastIndexOf('</script>');
            const divEnd = output.lastIndexOf('</div>');
            const lastEnd = Math.max(divEnd, scriptEnd + 9);

            if (divStart !== -1 && lastEnd !== -1) {
                output = output.substring(divStart, lastEnd).trim();
            }

            console.log('📝 Validating composition...');
            const validation = await validateComposition(output);
            if (validation.valid) {
                console.log('✅ Composition VALID');
                return output;
            }

            console.warn('❌ Composition INVALID:', validation.error);
            lastOutput = 'ERRORS:\n' + validation.error + '\n\nHTML:\n' + output;
        } catch (err) {
            console.error('💥 Error in generateWithRetry:', err.message);
            lastOutput = err.message;
        }
    }
    throw new Error('AI failed to generate valid HTML: ' + lastOutput);
}

app.post('/chat', async (req, res) => {
    const { message, composition, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    try {
        const html = await generateWithRetry({ message, composition, chatHistory: history });
        try { await Video.create({ prompt: message, html }); } catch (e) {}
        res.json({ html });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const jobs = new Map();

app.post('/render', async (req, res) => {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: 'No HTML' });
    const jobId = Date.now().toString();
    jobs.set(jobId, { status: 'preparing', progress: 0, log: 'Initializing...' });
    res.json({ jobId });
    try {
        const buffer = await renderVideo(html, (progress, log) => {
            jobs.set(jobId, { status: 'rendering', progress, log });
        });
        jobs.set(jobId, { status: 'completed', progress: 100, buffer });
        setTimeout(() => jobs.delete(jobId), 300000);
    } catch (err) {
        jobs.set(jobId, { status: 'failed', error: err.message });
    }
});

app.get('/render-status/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Not found' });
    res.json({ status: job.status, progress: job.progress, log: job.log, error: job.error });
});

app.get('/download/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job || job.status !== 'completed') return res.status(404).send('Not ready');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');
    res.send(job.buffer);
});

app.listen(5000, () => console.log('Server: http://localhost:5000'));