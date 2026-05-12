import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Zap, Shield, ChevronRight, Video, Monitor, Cpu } from 'lucide-react';

export default function Landing({ onLaunch }) {
  const features = [
    {
      icon: <Cpu className="text-primary" />,
      title: "Hyperframes Engine",
      description: "Next-gen HTML5/GSAP rendering pipeline for frame-accurate video production."
    },
    {
      icon: <Sparkles className="text-primary" />,
      title: "AI-Driven Compositions",
      description: "Transform natural language into complex, layered video compositions instantly."
    },
    {
      icon: <Zap className="text-primary" />,
      title: "Real-time Preview",
      description: "See changes as you type with our integrated high-performance preview studio."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden">
      
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.08] bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Video size={24} />
            </div>
            <span className="text-2xl font-bold font-outfit tracking-tight">viden<span className="text-primary">GenAI</span></span>
          </div>
          <button 
            onClick={onLaunch}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-primary transition-colors flex items-center gap-2 group"
          >
            Launch Studio
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-medium uppercase tracking-widest text-primary mb-6 inline-block">
              Powered by Hyperframes Engine v0.5
            </span>
            <h1 className="text-6xl md:text-8xl font-bold font-outfit tracking-tight leading-[1.1] mb-6">
              AI Video Production <br />
              <span className="gradient-text">at the Speed of Thought</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Generate, preview, and render high-fidelity video compositions using natural language. 
              Built on the open-source Hyperframes framework for developers and creators.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <button 
              onClick={onLaunch}
              className="px-8 py-4 rounded-2xl bg-primary text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all flex items-center gap-3"
            >
              <Play size={20} fill="currentColor" />
              Start Generating
            </button>
            <button className="px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-bold text-lg hover:bg-white/[0.1] transition-all">
              View Showcase
            </button>
          </motion.div>
        </div>

        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-6xl mx-auto mt-20 relative"
        >
          <div className="relative rounded-[2.5rem] p-4 bg-white/[0.02] border border-white/[0.08] shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
            <img 
              src="./videngenai_hero_mockup_1778573940798.png" 
              alt="videnGenAI Interface" 
              className="w-full rounded-[1.8rem] border border-white/[0.05] group-hover:scale-[1.01] transition-transform duration-700"
            />
          </div>
        </motion.div>
      </section>

      
      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-primary/30 transition-all space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold font-outfit">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      <footer className="py-20 px-6 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Video size={20} className="text-primary" />
            <span className="font-bold tracking-tight">videnGenAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Antigravity Labs. Powered by Hyperframes.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
