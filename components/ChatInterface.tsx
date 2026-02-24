import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Search, BookOpen, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getSovereignResponse } from '../services/ai';
import { socket } from '../lib/socket';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  isEvolving?: boolean;
  citations?: any[];
}

export const ChatInterface = ({ sessionId }: { sessionId: string }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    socket.emit('join-session', sessionId);

    socket.on('chat-history', (history: Message[]) => {
      setMessages(history);
    });

    socket.on('chat-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('chat-history');
      socket.off('chat-message');
    };
  }, [sessionId]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (scrollRef.current && autoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    socket.emit('new-message', { sessionId, message: userMsg });
    
    setInput('');
    setIsTyping(true);

    try {
      // Pass 1: Speed Layer (Gemini Flash)
      const pass1 = await getSovereignResponse(input, 'speed');
      const assistantMsg: Message = { 
        role: 'assistant', 
        content: pass1.text, 
        source: pass1.source,
        isEvolving: true 
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      socket.emit('new-message', { sessionId, message: assistantMsg });

      // Pass 2: Deep Layer (Gemini Pro) - Background Evolution
      const pass2Promise = getSovereignResponse(input, 'deep');
      
      pass2Promise.then(async (pass2) => {
        const evolvedMsg: Message = {
          role: 'assistant',
          content: pass2.text,
          source: pass2.source,
          isEvolving: false,
          citations: pass2.groundingMetadata?.groundingChunks
        };

        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length === 0) return prev;
          
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            newMessages[newMessages.length - 1] = evolvedMsg;
          }
          return newMessages;
        });

        socket.emit('update-last-message', { sessionId, message: evolvedMsg });

        // Push to Canvas if it looks like a document/code
        if ((pass2.text?.length || 0) > 200 || pass2.text?.includes('```')) {
          socket.emit('update-canvas', { sessionId, content: pass2.text });
        }
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border-r border-white/5 relative">
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-white/5 border border-white/10 text-white/90'
            }`}>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
              
              {msg.isEvolving && (
                <div className="mt-2 flex items-center gap-2 text-[10px] text-primary animate-pulse">
                  <Sparkles size={12} />
                  <span>NEURAL EVOLUTION IN PROGRESS...</span>
                </div>
              )}

              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.citations.map((c: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCitation(c.web)}
                      className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                      <BookOpen size={10} />
                      [{idx + 1}] {c.web?.title?.substring(0, 20)}...
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-2xl animate-pulse flex gap-2">
              <div className="w-2 h-2 bg-white/20 rounded-full" />
              <div className="w-2 h-2 bg-white/20 rounded-full" />
              <div className="w-2 h-2 bg-white/20 rounded-full" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything... (Deep Layer Active)"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={handleSend}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-lg text-white hover:bg-blue-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedCitation && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-y-0 right-0 w-80 bg-zinc-900 border-l border-white/10 z-20 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Search size={14} /> SOURCE PREVIEW
              </h3>
              <button onClick={() => setSelectedCitation(null)} className="text-white/40 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-lg">{selectedCitation.title}</h4>
              <p className="text-sm text-white/60 line-clamp-6">{selectedCitation.snippet}</p>
              <a 
                href={selectedCitation.uri} 
                target="_blank" 
                className="inline-flex items-center gap-2 text-primary text-sm hover:underline"
              >
                Visit Website <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
