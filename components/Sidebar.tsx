import React from 'react';
import { LayoutGrid, MessageSquare, FileText, ExternalLink, Zap, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  sessions: string[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export const Sidebar = ({ sessions, activeSessionId, onSelectSession, onNewSession }: SidebarProps) => {
  return (
    <div className="w-16 h-screen bg-black border-r border-white/10 flex flex-col items-center py-6 gap-8 fixed left-0 top-0 z-50">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
        <Zap className="text-white w-6 h-6" />
      </div>
      
      <nav className="flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar py-2">
        <SidebarIcon 
          icon={<Plus size={20} />} 
          onClick={onNewSession}
          tooltip="New Chat"
        />
        
        <div className="w-8 h-[1px] bg-white/10 mx-auto" />

        {sessions.map((id) => (
          <SidebarIcon 
            key={id}
            icon={<MessageSquare size={20} />} 
            active={activeSessionId === id}
            onClick={() => onSelectSession(id)}
            tooltip={`Chat ${id.slice(-4)}`}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4 pb-6">
        <a href="https://ephchat-mu.vercel.app" target="_blank" className="text-white/40 hover:text-primary transition-colors">
          <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
};

const SidebarIcon = ({ 
  icon, 
  active = false, 
  onClick,
  tooltip 
}: { 
  icon: React.ReactNode, 
  active?: boolean,
  onClick?: () => void,
  tooltip?: string
}) => (
  <motion.div 
    whileHover={{ scale: 1.1 }}
    onClick={onClick}
    title={tooltip}
    className={`p-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-primary/20 text-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
  >
    {icon}
  </motion.div>
);
