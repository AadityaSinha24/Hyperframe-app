import React, { useState } from "react";
import Chat from "./components/Chat";
import Preview from "./components/Preview";
import DownloadButton from "./components/DownloadButton";
import Landing from "./components/Landing";

export default function App() {
  const [showStudio, setShowStudio] = useState(false);

  if (!showStudio) {
    return <Landing onLaunch={() => setShowStudio(true)} />;
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden font-outfit text-white">
     
      <aside className="w-[400px] h-full flex flex-col shrink-0">
        <Chat />
      </aside>
      
     
      <main className="flex-1 flex flex-col h-full bg-[#050505] relative">
        <div className="flex-1 overflow-hidden">
          <Preview />
        </div>
        
        <div className="p-6 border-t border-white/[0.08] flex justify-center bg-black/40 backdrop-blur-xl">
          <div className="max-w-md w-full">
            <DownloadButton />
          </div>
        </div>
        
        <footer className="absolute bottom-2 right-6">
          <p className="text-[10px] text-white/20 font-mono tracking-tighter">
            PROTOTYPE V1 // HYPERFRAMES ENGINE
          </p>
        </footer>
      </main>
    </div>
  );
}
