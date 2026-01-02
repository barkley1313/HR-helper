import React, { useState } from 'react';
import { Person, Group } from '../types';
import { Users, Wand2, RefreshCcw, LayoutGrid, Download } from 'lucide-react';
import { generateTeamIdentity } from '../services/geminiService';

interface GroupGeneratorProps {
  names: Person[];
}

const GroupGenerator: React.FC<GroupGeneratorProps> = ({ names }) => {
  const [groupSize, setGroupSize] = useState<number>(3);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  // Fisher-Yates shuffle
  const shuffleArray = (array: Person[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generateGroups = () => {
    if (groupSize < 1) return;
    
    const shuffled = shuffleArray(names);
    const newGroups: Group[] = [];
    
    // Chunking logic
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push({
        id: crypto.randomUUID(),
        members: shuffled.slice(i, i + groupSize)
      });
    }

    setGroups(newGroups);
    setIsGenerated(true);
  };

  const generateTeamName = async (groupId: string, memberNames: string[]) => {
    // Optimistic UI or loading state
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, isLoadingAi: true } : g));

    try {
      const identity = await generateTeamIdentity(memberNames);
      setGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, aiIdentity: identity, isLoadingAi: false } : g
      ));
    } catch (e) {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, isLoadingAi: false } : g));
    }
  };

  const downloadCSV = () => {
    if (groups.length === 0) return;

    // CSV Header
    let csvContent = "Group Number,Team Name,Motto,Member Name\n";

    // CSV Rows
    groups.forEach((group, index) => {
      const groupNum = index + 1;
      const teamName = group.aiIdentity?.teamName ? `"${group.aiIdentity.teamName.replace(/"/g, '""')}"` : "";
      const motto = group.aiIdentity?.motto ? `"${group.aiIdentity.motto.replace(/"/g, '""')}"` : "";

      group.members.forEach(member => {
        const memberName = `"${member.name.replace(/"/g, '""')}"`;
        csvContent += `${groupNum},${teamName},${motto},${memberName}\n`;
      });
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "groups_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Automatic Grouping</h2>
            <p className="text-slate-500 text-sm">Total: {names.length} people</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 justify-center md:justify-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase text-slate-400">Group Size</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="2"
                max={Math.max(2, Math.floor(names.length / 2))}
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value))}
                className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="font-mono font-bold text-lg w-8 text-center">{groupSize}</span>
              <span className="text-slate-400 text-sm">per group</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={generateGroups}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-transform hover:scale-105 active:scale-95 shadow-md shadow-indigo-200"
            >
              {isGenerated ? <RefreshCcw size={18} /> : <LayoutGrid size={18} />}
              {isGenerated ? 'Regroup' : 'Generate'}
            </button>
            
            {isGenerated && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-semibold transition-colors"
                title="Download as CSV"
              >
                <Download size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {isGenerated && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {groups.map((group, idx) => (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-700 text-lg">Group {idx + 1}</h3>
                  <span className="text-xs text-slate-400">{group.members.length} members</span>
                </div>
                
                <button
                  onClick={() => generateTeamName(group.id, group.members.map(m => m.name))}
                  disabled={group.isLoadingAi || !!group.aiIdentity}
                  className={`
                    p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors
                    ${group.aiIdentity 
                      ? 'text-emerald-600 bg-emerald-50 cursor-default' 
                      : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}
                  `}
                  title="Generate team name with AI"
                >
                  {group.isLoadingAi ? (
                    <span className="animate-pulse">Thinking...</span>
                  ) : group.aiIdentity ? (
                    <span>AI Named</span>
                  ) : (
                    <>
                      <Wand2 size={14} />
                      <span>Name Team</span>
                    </>
                  )}
                </button>
              </div>

              {group.aiIdentity && (
                 <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-100">
                    <p className="text-emerald-800 font-bold text-sm">"{group.aiIdentity.teamName}"</p>
                    <p className="text-emerald-600 text-xs italic mt-0.5">{group.aiIdentity.motto}</p>
                 </div>
              )}

              <div className="p-4 flex-1">
                <ul className="space-y-2">
                  {group.members.map(member => (
                    <li key={member.id} className="flex items-center gap-2 text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{member.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {names.length === 0 && (
         <div className="text-center py-20 text-slate-400">
            Please add names in the Input tab first.
         </div>
      )}
    </div>
  );
};

export default GroupGenerator;