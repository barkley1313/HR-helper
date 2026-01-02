import React, { useState } from 'react';
import { Person, AppTab } from './types';
import NameInput from './components/NameInput';
import LuckyDraw from './components/LuckyDraw';
import GroupGenerator from './components/GroupGenerator';
import { Users, Gift, ListStart } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.INPUT);
  const [names, setNames] = useState<Person[]>([]);

  // Simple navigation handler
  const renderContent = () => {
    switch (activeTab) {
      case AppTab.INPUT:
        return (
          <NameInput 
            names={names} 
            setNames={setNames} 
            onContinue={() => setActiveTab(AppTab.LUCKY_DRAW)} 
          />
        );
      case AppTab.LUCKY_DRAW:
        return <LuckyDraw allNames={names} />;
      case AppTab.GROUPING:
        return <GroupGenerator names={names} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-700">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              HR
            </div>
            <span>ToolBox</span>
          </div>

          <nav className="flex gap-1 md:gap-4">
            <button
              onClick={() => setActiveTab(AppTab.INPUT)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === AppTab.INPUT 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <ListStart size={18} />
              <span className="hidden md:inline">List Input</span>
            </button>
            <button
              onClick={() => setActiveTab(AppTab.LUCKY_DRAW)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === AppTab.LUCKY_DRAW 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Gift size={18} />
              <span className="hidden md:inline">Lucky Draw</span>
            </button>
            <button
              onClick={() => setActiveTab(AppTab.GROUPING)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === AppTab.GROUPING 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Users size={18} />
              <span className="hidden md:inline">Grouping</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {renderContent()}
      </main>
      
      {/* Footer */}
      <footer className="text-center py-6 text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} HR ToolBox. All logic runs locally in browser.</p>
      </footer>
    </div>
  );
};

export default App;
