import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { Canvas } from './components/Canvas';
import { AdBanner } from './components/AdBanner';

export default function App() {
  // Use a fixed session ID for demo purposes, or generate one
  const [sessionId] = useState('default-session');

  return (
    <div className="flex h-screen w-screen bg-deep-black overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-16 grid grid-cols-1 lg:grid-cols-2 h-full">
        <div className="h-full border-r border-white/5">
          <ChatInterface sessionId={sessionId} />
        </div>
        
        <div className="hidden lg:block h-full">
          <Canvas sessionId={sessionId} />
        </div>
      </main>

      <AdBanner />
    </div>
  );
}
