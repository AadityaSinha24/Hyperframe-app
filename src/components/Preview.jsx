// src/components/Preview.jsx
import { useStore } from "../store/useStore";
import { useRef, useEffect } from "react";
import { Monitor, Info } from "lucide-react";

export default function Preview() {
  const { composition } = useStore();

  const getSrcDoc = () => {
    if (!composition) return "";
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            width: 100vw; 
            height: 100vh; 
            background: black; 
            overflow: hidden; 
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #canvas-wrapper { 
            position: relative; 
            width: 1920px; 
            height: 1080px; 
            background: #000;
            flex-shrink: 0;
          }
        </style>
      </head>
      <body>
        <div id="canvas-wrapper">
          ${composition}
        </div>
        <script>
          function scale() {
            const wrapper = document.getElementById('canvas-wrapper');
            const root = wrapper.firstElementChild;
            const w = root?.getAttribute('data-width') || 1920;
            const h = root?.getAttribute('data-height') || 1080;
            
            const scale = Math.min(window.innerWidth / w, window.innerHeight / h);
            wrapper.style.transform = \`scale(\${scale})\`;
          }
          window.addEventListener('resize', scale);
          setTimeout(scale, 50);
          window.onload = scale;
        </script>
      </body>
      </html>
    `;
  };

  return (
    <div className="flex flex-col flex-1 h-full p-8 bg-black">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/[0.05]">
            <Monitor size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-outfit font-semibold">Hyperframes Preview</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Official HTML Runtime</p>
          </div>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center group">
        {!composition && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 z-10">
            <div className="w-20 h-20 rounded-full border border-dashed border-white/10 flex items-center justify-center">
              <Monitor size={32} className="text-white/10" />
            </div>
            <p className="text-sm text-white/20 font-medium">Waiting for composition...</p>
          </div>
        )}

        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/[0.08] bg-[#080808] shadow-2xl group-hover:border-white/20 transition-colors">
          <iframe
            srcDoc={getSrcDoc()}
            className="w-full h-full border-none"
            title="Hyperframes Preview"
          />
        </div>
      </div>
      
      <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3">
        <Info size={16} className="text-primary mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          This preview uses the official Hyperframes HTML & GSAP runtime. The LLM generates standard data attributes (data-start, data-duration) to control timing.
        </p>
      </div>
    </div>
  );
}



