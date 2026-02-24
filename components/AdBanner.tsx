import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Info, X } from 'lucide-react';

export const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [ad] = useState<any>({
    title: 'Ephchat Pro',
    description: 'Unlock the full power of real-time collaboration.',
    link: 'https://ephchat-mu.vercel.app'
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-80 bg-primary/10 backdrop-blur-xl border border-primary/20 rounded-2xl p-4 shadow-2xl"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">ECOSYSTEM PARTNER</span>
              <Info size={12} className="text-white/20" />
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-white/20 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <h4 className="text-sm font-bold mb-1">{ad.title}</h4>
          <p className="text-xs text-white/60 mb-3">{ad.description}</p>
          <a 
            href={ad.link} 
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 bg-primary rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors"
          >
            LEARN MORE <ExternalLink size={12} />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
