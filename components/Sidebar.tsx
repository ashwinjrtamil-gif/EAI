import React from 'react';
import { LayoutGrid, MessageSquare, FileText, ExternalLink, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export const Sidebar = () => {
  return (
    <div className="w-16 h-screen bg-black border-r border-white/10 flex flex-col items-center py-6 gap-8 fixed left-0 top-0 z-50">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
        <Zap className="text-white w-6 h-6" />
      </div>
      
      <nav className="flex flex-col gap-6">
        <SidebarIcon icon={<MessageSquare size={20} />} active />
        <SidebarIcon icon={<FileText size={20} />} />
        <SidebarIcon icon={<LayoutGrid size={20} />} />
      </nav>

      <div className="mt-auto flex flex-col gap-4 pb-6">
        <a href="https://ephchat-mu.vercel.app" target="_blank" className="text-white/40 hover:text-primary transition-colors">
          <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
};

const SidebarIcon = ({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) => (
  <motion.div 
    whileHover={{ scale: 1.1 }}
    className={`p-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-primary/20 text-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
  >
    {icon}
  </motion.div>
);
