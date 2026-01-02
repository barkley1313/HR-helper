import React, { useState, useRef, useMemo } from 'react';
import { Upload, UserPlus, FileText, Trash2, CheckCircle2, Sparkles, AlertCircle, CopyX } from 'lucide-react';
import { Person } from '../types';

interface NameInputProps {
  names: Person[];
  setNames: (names: Person[]) => void;
  onContinue: () => void;
}

const DEMO_NAMES = [
  "Alice Smith", "Bob Jones", "Charlie Brown", "David Wilson", "Eve Miller",
  "Frank Davis", "Grace Taylor", "Henry Anderson", "Ivy Thomas", "Jack White",
  "Kevin Harris", "Lily Clark", "Mike Lewis", "Nancy Walker", "Oscar Hall",
  "Pamela Young", "Quinn Allen", "Ray King", "Sarah Scott", "Tom Green",
  "Ursula Baker", "Victor Adams", "Wendy Nelson", "Xander Carter", "Yara Mitchell", "Zack Roberts"
];

const NameInput: React.FC<NameInputProps> = ({ names, setNames, onContinue }) => {
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analyze duplicates
  const { nameCounts, hasDuplicates } = useMemo(() => {
    const counts: Record<string, number> = {};
    names.forEach(p => {
      counts[p.name] = (counts[p.name] || 0) + 1;
    });
    const hasDupes = Object.values(counts).some(c => c > 1);
    return { nameCounts: counts, hasDuplicates: hasDupes };
  }, [names]);

  const parseNames = (input: string) => {
    const lines = input.split(/\r?\n|,\s*/);
    const newPeople: Person[] = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(name => ({
        id: crypto.randomUUID(),
        name
      }));
    return newPeople;
  };

  const handleTextPaste = () => {
    if (!textInput.trim()) return;
    const newPeople = parseNames(textInput);
    setNames([...names, ...newPeople]);
    setTextInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const newPeople = parseNames(text);
        setNames([...names, ...newPeople]);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadDemoData = () => {
    const newPeople = DEMO_NAMES.map(name => ({
      id: crypto.randomUUID(),
      name
    }));
    setNames([...names, ...newPeople]);
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const uniqueList: Person[] = [];
    
    names.forEach(p => {
      if (!seen.has(p.name)) {
        seen.add(p.name);
        uniqueList.push(p);
      }
    });
    
    setNames(uniqueList);
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear the entire list?')) {
      setNames([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">名單管理 (List Management)</h2>
        <p className="text-slate-500">Import names via CSV, paste directly, or use demo data to start.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-end">
             <button 
               onClick={loadDemoData}
               className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
             >
               <Sparkles size={14} /> Load Demo List
             </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Paste Names (One per line)
            </label>
            <textarea
              className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Alice&#10;Bob&#10;Charlie"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button
              onClick={handleTextPaste}
              disabled={!textInput.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <UserPlus size={18} />
              Add to List
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or import file</span>
            </div>
          </div>

          <div>
            <input
              type="file"
              accept=".csv,.txt"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 py-6 rounded-xl transition-all group"
            >
              <Upload size={24} className="group-hover:scale-110 transition-transform" />
              <span>Upload CSV / TXT</span>
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-indigo-500" />
                Current List <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{names.length}</span>
              </h3>
              {names.length > 0 && (
                <button onClick={clearAll} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                  <Trash2 size={14} /> Clear
                </button>
              )}
            </div>

            {hasDuplicates && (
               <div className="flex items-center justify-between bg-amber-50 text-amber-800 p-2 rounded-lg text-sm border border-amber-200">
                  <span className="flex items-center gap-2">
                    <AlertCircle size={16} /> Duplicates found
                  </span>
                  <button 
                    onClick={removeDuplicates}
                    className="flex items-center gap-1 bg-white border border-amber-300 shadow-sm px-2 py-1 rounded text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    <CopyX size={14} /> Remove All
                  </button>
               </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px] border rounded-lg p-2 bg-slate-50">
            {names.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <UserPlus size={48} className="mb-2 opacity-20" />
                <p>No names added yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {names.map((p, idx) => {
                  const isDuplicate = nameCounts[p.name] > 1;
                  return (
                    <li key={p.id} className={`py-2 px-3 flex items-center gap-3 hover:bg-slate-100 rounded text-sm ${isDuplicate ? 'bg-red-50' : ''}`}>
                      <span className="text-slate-400 w-6 font-mono text-xs">{idx + 1}</span>
                      <span className={`font-medium flex-1 ${isDuplicate ? 'text-red-600' : 'text-slate-700'}`}>
                        {p.name}
                      </span>
                      {isDuplicate && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                          DUPLICATE
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {names.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onContinue}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <CheckCircle2 />
            Ready to Start
          </button>
        </div>
      )}
    </div>
  );
};

export default NameInput;