import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { Canvas } from './components/Canvas';
import { AdBanner } from './components/AdBanner';

export default function App() {
  const [sessionId, setSessionId] = useState('session-' + Date.now());
  const [sessions, setSessions] = useState<string[]>([sessionId]);

  const createNewSession = () => {
    const newId = 'session-' + Date.now();
    setSessions(prev => [newId, ...prev]);
    setSessionId(newId);
  };

  return (
    <div className="flex h-screen w-screen bg-deep-black overflow-hidden font-sans">
      <Sidebar 
        sessions={sessions} 
        activeSessionId={sessionId} 
        onSelectSession={setSessionId}
        onNewSession={createNewSession}
      />
      
      <main className="flex-1 ml-16 grid grid-cols-1 lg:grid-cols-2 h-full">
        <div className="h-full border-r border-white/5">
          <ChatInterface key={sessionId} sessionId={sessionId} />
        </div>
        
        <div className="hidden lg:block h-full">
          <Canvas key={sessionId} sessionId={sessionId} />
        </div>
      </main>

      <AdBanner />
    </div>
  );
}
