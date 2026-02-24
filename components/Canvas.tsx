import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { socket } from '../lib/socket';
import { motion } from 'motion/react';
import { Edit3, Share2, Download } from 'lucide-react';

export const Canvas = ({ sessionId }: { sessionId: string }) => {
  const [content, setContent] = useState('# The Canvas\n\nYour AI-generated documents will appear here in real-time.');
  const [toc, setToc] = useState<{ id: string, text: string, level: number }[]>([]);

  useEffect(() => {
    socket.emit('join-session', sessionId);

    socket.on('canvas-update', (newContent: string) => {
      setContent(newContent);
      // Extract headers for TOC
      const headers = newContent?.match(/^#{1,3}\s+.+$/gm) || [];
      const tocItems = headers.map(h => {
        const level = (h.match(/#/g) || []).length;
        const text = h.replace(/^#+\s+/, '');
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        return { id, text, level };
      });
      setToc(tocItems);
    });

    return () => {
      socket.off('canvas-update');
    };
  }, [sessionId]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-full bg-deep-black flex relative overflow-hidden">
      {/* TOC Sidebar */}
      {toc.length > 0 && (
        <div className="w-64 border-r border-white/5 p-6 overflow-y-auto hidden xl:block">
          <h3 className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-6">NAVIGATION</h3>
          <nav className="space-y-4">
            {toc.map((item, i) => (
              <button
                key={i}
                onClick={() => scrollToSection(item.id)}
                className={`block text-left text-xs hover:text-primary transition-colors ${
                  item.level === 1 ? 'font-bold text-white/80' : 
                  item.level === 2 ? 'pl-3 text-white/60' : 'pl-6 text-white/40'
                }`}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className="flex-1 p-8 overflow-y-auto relative no-scrollbar">
        <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Edit3 size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">WORKSPACE CANVAS</h2>
          </div>
          <div className="flex gap-3">
            <button className="p-2 text-white/40 hover:text-white transition-colors"><Share2 size={18} /></button>
            <button className="p-2 text-white/40 hover:text-white transition-colors"><Download size={18} /></button>
          </div>
        </div>

        <motion.div
          key={content}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="markdown-body prose prose-invert max-w-none"
        >
          <ReactMarkdown 
            remarkPlugins={[remarkMath]} 
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ children }) => {
                const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
                return <h1 id={id}>{children}</h1>;
              },
              h2: ({ children }) => {
                const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
                return <h2 id={id}>{children}</h2>;
              },
              h3: ({ children }) => {
                const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
                return <h3 id={id}>{children}</h3>;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </motion.div>
      </div>
    </div>
  </div>
  );
};
