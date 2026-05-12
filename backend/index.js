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

import { v2 as cloudinary } from 'cloudinary';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/videngenai')
    .then(() => console.log('🍃 MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

app.get('/', (req, res) => res.send('Hyperframes Engine is Live!'));

const SYSTEM_PROMPT = 'You are a Senior Hyperframes Motion Engineer. Create high-end cinematic video compositions using HTML/CSS/GSAP.\n\n═══ CORE STRUCTURE ═══\nEvery composition MUST use this exact format:\n<div data-composition-id="vid" data-start="0" data-width="1920" data-height="1080" data-duration="10" style="position:relative; width:1920px; height:1080px; background:#000; overflow:hidden;">\n  <!-- Visual Elements (Clips) -->\n  <img id="bg1" class="clip" src="..." data-start="0" data-duration="5" data-track-index="0" style="position:absolute; width:100%; height:100%; object-fit:cover;">\n  <div id="text1" class="clip" data-start="1" data-duration="4" data-track-index="1" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:120px; font-family:sans-serif; font-weight:bold;">MODERN VISION</div>\n\n  <!-- GSAP Animation Logic -->\n  <script>\n    (function() {\n      const tl = gsap.timeline();\n      // Cinematic Camera Motion\n      tl.fromTo("#bg1", { scale: 1.2, x: -50 }, { scale: 1, x: 0, duration: 5, ease: "sine.inOut" }, 0);\n      // Professional Text reveal\n      tl.fromTo("#text1", { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1.5, ease: "expo.out" }, 1);\n      // Cleanup (Mandatory: Kill elements at their end time)\n      tl.set("#bg1", { opacity: 0, visibility: "hidden" }, 5);\n      tl.set("#text1", { opacity: 0, visibility: "hidden" }, 5);\n      \n      window.__timelines = window.__timelines || {};\n      window.__timelines["vid"] = tl;\n    })();\n  </script>\n</div>\n\n═══ CINEMATIC RULES ═══\n1. MULTI-CLIP: Use multiple <img> or <div background> clips in sequence (e.g., Clip A: 0-5s, Clip B: 5-10s).\n2. CAMERA MOTION: Always add a subtle scale (1.2 -> 1.0) or pan to static images using GSAP.\n3. OVERLAYS: Use semi-transparent gradients or drop-shadows on text for readability.\n4. TIMELINE: Always register the timeline to window.__timelines["vid"].\n\n═══ ASSET LIBRARY ═══\n- Nature: https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80\n- Ocean: https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1920&q=80\n- Cyberpunk: https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80\n- Space: https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80\n- Abstract: https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80\n\nReturn ONLY HTML. No markdown, no conversational text.';

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
                model: 'llama-3.1-8b-instant',
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

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "video", folder: "hyperframes" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};

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
        
        jobs.set(jobId, { status: 'uploading', progress: 95, log: 'Uploading to cloud...' });
        const videoUrl = await uploadToCloudinary(buffer);
        
        jobs.set(jobId, { status: 'completed', progress: 100, videoUrl });
        setTimeout(() => jobs.delete(jobId), 600000); // Keep for 10 mins
    } catch (err) {
        jobs.set(jobId, { status: 'failed', error: err.message });
    }
});

app.get('/render-status/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Not found' });
    res.json({ 
        status: job.status, 
        progress: job.progress, 
        log: job.log, 
        error: job.error,
        videoUrl: job.videoUrl 
    });
});

app.get('/download/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job || job.status !== 'completed') return res.status(404).send('Not ready');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');
    res.send(job.buffer);
});

app.listen(5000, () => console.log('Server: http://localhost:5000'));