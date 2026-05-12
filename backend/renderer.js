import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import ffmpegStatic from "ffmpeg-static";

/**
 * Renders Hyperframes HTML to a video buffer using the official CLI
 * @param {string} html - The Hyperframes composition HTML
 * @param {function} onProgress - Callback for progress (progress, log)
 * @returns {Promise<Buffer>} - Video file buffer
 */
export async function renderVideo(html, onProgress = () => {}) {
    const tempDir = path.join(os.tmpdir(), `hyperframes-${Date.now()}`);
    const htmlPath = path.join(tempDir, "index.html");
    const outputPath = path.join(tempDir, "out.mp4");

    try {
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Write the composition to index.html
        fs.writeFileSync(htmlPath, '<!DOCTYPE html>\n<html>\n<head>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>\n</head>\n<body>\n' + html + '\n</body>\n</html>');

        const ffmpegBinary = ffmpegStatic;
        const ffmpegDir = path.dirname(ffmpegBinary);
        const localFfmpegPath = path.join(tempDir, os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
        fs.copyFileSync(ffmpegBinary, localFfmpegPath);

        const projectRoot = process.cwd();
        const localBin = path.join(projectRoot, 'node_modules', '.bin');

        const env = { 
            ...process.env, 
            PATH: `${localBin}${path.delimiter}${tempDir}${path.delimiter}${ffmpegDir}${path.delimiter}${process.env.PATH || ""}`,
            Path: `${localBin}${path.delimiter}${tempDir}${path.delimiter}${ffmpegDir}${path.delimiter}${process.env.Path || ""}`
        };

        const hyperframesBin = path.join(localBin, os.platform() === 'win32' ? 'hyperframes.cmd' : 'hyperframes');

        return new Promise((resolve, reject) => {
            console.log("🚀 Starting hyperframes spawn...");
            // Directly call the local binary to avoid npx download/engine warnings
            const child = spawn(hyperframesBin, ["render", "-o", "out.mp4", "--no-audio"], {
                cwd: tempDir,
                env,
                shell: true
            });

            child.stdout.on("data", (data) => {
                const line = data.toString().trim();
                console.log(`[HF] ${line}`);
                
                // Parse percentage (e.g. "25%  Extracting frames")
                const match = line.match(/(\d+)%/);
                if (match) {
                    onProgress(parseInt(match[1]), line);
                }
            });

            child.stderr.on("data", (data) => {
                console.warn(`[HF-ERR] ${data.toString()}`);
            });

            child.on("close", (code) => {
                if (code !== 0) {
                    return reject(new Error(`Render failed with code ${code}`));
                }

                if (!fs.existsSync(outputPath)) {
                    return reject(new Error("Render failed: out.mp4 not found"));
                }

                const buffer = fs.readFileSync(outputPath);
                
                // Cleanup
                const cleanup = (retries = 5) => {
                    setTimeout(() => {
                        try {
                            if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
                        } catch (e) { if (retries > 0) cleanup(retries - 1); }
                    }, 2000);
                };
                cleanup();

                resolve(buffer);
            });
        });
    } catch (err) {
        console.error("❌ RENDER SETUP ERROR:", err.message);
        throw err;
    }
}

export default renderVideo;
