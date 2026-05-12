import axios from "axios";
import { useState } from "react";
import { useStore } from "../store/useStore";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function DownloadButton() {
  const { composition } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLog, setStatusLog] = useState("");

  const handleDownload = async () => {
    if (!composition) return;
    
    setLoading(true);
    setError("");
    setProgress(0);
    setStatusLog("Starting export job...");

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      // 1. Request Render
      const startRes = await axios.post(`${apiUrl}/render`, { html: composition });
      const { jobId } = startRes.data;

      // 2. Poll Status
      const poll = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${apiUrl}/render-status/${jobId}`);
          const { status, progress: p, log, error: jobErr, videoUrl } = statusRes.data;

          if (status === "failed") {
            clearInterval(poll);
            setError(jobErr || "Render failed");
            setLoading(false);
            return;
          }

          setProgress(p || 0);
          setStatusLog(log || "Rendering...");

          if (status === "completed" && videoUrl) {
            setStatusLog("Success!");
            setProgress(100);

            // 3. Trigger Download from Cloudinary
            const link = document.createElement('a');
            link.href = videoUrl;
            link.setAttribute('download', 'hyperframes_video.mp4');
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setLoading(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
            return;
          }
        } catch (e) {
          clearInterval(poll);
          setError("Connection lost during rendering.");
          setLoading(false);
        }
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to start rendering");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDownload}
        disabled={loading || !composition}
        className={`
          relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all overflow-hidden
          ${loading 
            ? 'bg-white/5 text-white/40 cursor-wait' 
            : success 
              ? 'bg-green-500 text-black' 
              : 'bg-primary text-black hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]'}
          disabled:opacity-50 disabled:hover:shadow-none
        `}
      >
        {loading && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute left-0 top-0 bottom-0 bg-primary/20 pointer-events-none"
          />
        )}

        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span className="relative z-10">
              {progress > 0 ? `${progress}% Completed` : "Processing..."}
            </span>
          </>
        ) : success ? (
          <>
            <CheckCircle size={20} />
            <span>Success! Video Exported</span>
          </>
        ) : (
          <>
            <Download size={20} />
            <span>Export Production MP4</span>
          </>
        )}
      </motion.button>

      {loading && (
        <div className="w-full space-y-2">
          <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-white/40 px-1">
            <span>{statusLog}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary shadow-[0_0_10px_#00ff88]"
            />
          </div>
        </div>
      )}
      
      {error && (
        <div className="w-full text-red-400 text-xs font-medium bg-red-400/10 border border-red-400/20 p-4 rounded-xl flex items-start gap-3">
          <div className="mt-0.5">⚠️</div>
          <div className="whitespace-pre-wrap">{error}</div>
        </div>
      )}
    </div>
  );
}
