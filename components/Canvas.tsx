import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { socket } from '../lib/socket';
import { motion } from 'motion/react';
import { Edit3, Share2, Download } from 'lucide-react';

export const Canvas = ({ sessionId }: { sessionId: string }) => {
  const [content, setContent] = useState('# The Canvas\n\nYour AI-generated documents will appear here in real-time.');

  useEffect(() => {
    socket.emit('join-session', sessionId);

    socket.on('canvas-update', (newContent: string) => {
      setContent(newContent);
    });

    return () => {
      socket.off('canvas-update');
    };
  }, [sessionId]);

  return (
    <div className="h-full bg-deep-black p-8 overflow-y-auto relative">
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
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {content}
          </ReactMarkdown>
        </motion.div>
      </div>
    </div>
  );
};
