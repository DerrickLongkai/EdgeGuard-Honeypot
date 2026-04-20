import React from 'react';
import ThreatMap from './components/ThreatMap';
import TopIps from './components/TopIps';
import PasswordCloud from './components/PasswordCloud';

function App() {
    return (
        <div className="min-h-screen bg-[#0A0E17] text-white p-6">
            <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Cowrie Threat intelligence situation awareness screen
                </h1>
                <div className="text-cyan-400 font-mono">
                    System Status: ONLINE
                </div>
            </header>

          <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 space-y-6">
                  <div className="h-64 bg-slate-800/50 rounded-xl border border-slate-700 p-4 shadow-lg flex flex-col">
                      <h2 className="text-slate-400 mb-4 font-semibold flex items-center">
                          <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                          High-frequency attack source IP Top 10
                      </h2>
                      <div className="flex-1 overflow-hidden">
                          <TopIps />
                      </div>
                  </div>
                  <div className="h-64 bg-slate-800/50 rounded-xl border border-slate-700 p-4 shadow-lg flex flex-col">
                      <h2 className="text-slate-400 mb-2 font-semibold flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                          Explosive password word cloud
                      </h2>
                      <div className="flex-1 overflow-hidden">
                          <PasswordCloud />
                      </div>
                  </div>
              </div>

              <div className="col-span-1 md:col-span-2 h-[536px] bg-slate-800/50 rounded-xl border border-slate-700 p-4 shadow-lg shadow-cyan-500/10">
                  <h2 className="text-slate-400 mb-2 font-semibold">Real-time tracking of global threat sources</h2>
                  <div className="flex-1 w-full overflow-hidden">
                      <ThreatMap />
                  </div>
              </div>
          </main>
      </div>
  );
}

export default App;
