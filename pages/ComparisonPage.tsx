import React, { useState } from 'react';
import { TOOLS_REGISTRY } from '../constants';
import { ComparisonChart } from '../components/ComparisonChart';
import { Tool, ToolCategory } from '../types';
import { X, Pin, PinOff, Search, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { PageWrapper } from '../components/PageWrapper';

export const ComparisonPage: React.FC = () => {
  // Initialize with two distinct tools for demo purposes
  const [selectedTools, setSelectedTools] = useState<Tool[]>([TOOLS_REGISTRY[0], TOOLS_REGISTRY[3]]);
  const [pinnedToolId, setPinnedToolId] = useState<string | null>(TOOLS_REGISTRY[0].id);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleToggleCompare = (tool: Tool) => {
    if (selectedTools.find(t => t.id === tool.id)) {
      if (pinnedToolId === tool.id) {
        setPinnedToolId(null);
      }
      setSelectedTools(prev => prev.filter(t => t.id !== tool.id));
      setWarningMessage(null);
    } else {
      if (selectedTools.length >= 5) {
        setWarningMessage("Maximum 5 tools can be compared simultaneously.");
        setTimeout(() => setWarningMessage(null), 4000);
        return;
      }
      setSelectedTools(prev => [...prev, tool]);
      setWarningMessage(null);
    }
  };

  const handleTogglePin = (toolId: string) => {
    setPinnedToolId(prev => (prev === toolId ? null : toolId));
  };

  // Order tools so the pinned baseline tool always appears first
  const orderedTools = [...selectedTools].sort((a, b) => {
    if (a.id === pinnedToolId) return -1;
    if (b.id === pinnedToolId) return 1;
    return 0;
  });

  const filteredRegistry = TOOLS_REGISTRY.filter(tool => {
    const matchesQuery = !searchFilter || tool.name.toLowerCase().includes(searchFilter.toLowerCase()) || tool.category.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = categoryFilter === 'All' || tool.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-surface-text mb-3 uppercase tracking-widest">Compare AI Tools</h1>
        <p className="text-surface-muted font-mono text-sm md:text-base">
          Side-by-side benchmark matrix. Freeze a baseline tool to compare against alternative models and agents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visualization & Matrix Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
            <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg font-black text-surface-text flex items-center gap-2 uppercase tracking-widest">
                      <span className="w-2 h-6 bg-jenga-500 rounded-none"></span>
                      Performance Radar
                  </h3>
                  {pinnedToolId && (
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-jenga-500 bg-dark-900 border border-jenga-500 px-3 py-1 flex items-center gap-1.5">
                      <Pin className="w-3.5 h-3.5 fill-jenga-500" />
                      Baseline Frozen: {selectedTools.find(t => t.id === pinnedToolId)?.name}
                    </span>
                  )}
                </div>
                <ComparisonChart tools={orderedTools} />
            </div>

            {/* Detailed Table Matrix with Freeze Column */}
            <div className="bg-dark-800 border-4 border-dark-600 rounded-none shadow-[8px_8px_0px_0px_rgba(255,140,0,1)] mt-8 w-full overflow-hidden">
                <div className="p-4 bg-dark-900 border-b-4 border-dark-600 flex flex-wrap items-center justify-between gap-4">
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-mono font-black uppercase tracking-widest text-surface-text">Comparison Matrix</span>
                     <span className="text-xs font-mono text-surface-muted">({orderedTools.length} tools)</span>
                   </div>
                   <p className="text-xs font-mono text-surface-muted">Tip: Click the pin icon to freeze any tool as your benchmark.</p>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[700px] text-left text-sm text-surface-muted font-mono border-collapse">
                      <thead className="bg-dark-900 text-surface-text uppercase font-black text-xs tracking-widest border-b-4 border-dark-600">
                          <tr>
                              <th className="px-6 py-4 sticky left-0 z-20 bg-dark-900 border-r-2 border-dark-700 min-w-[180px]">Feature</th>
                              {orderedTools.map(t => {
                                const isPinned = t.id === pinnedToolId;
                                return (
                                  <th 
                                    key={t.id} 
                                    className={`px-6 py-4 min-w-[200px] transition-colors ${
                                      isPinned ? 'bg-dark-850 border-x-2 border-jenga-500 text-jenga-500' : 'border-r border-dark-700'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="truncate font-black">{t.name}</span>
                                      <button
                                        onClick={() => handleTogglePin(t.id)}
                                        title={isPinned ? "Unfreeze tool" : "Freeze as benchmark"}
                                        className={`p-1 border transition-colors ${
                                          isPinned 
                                            ? 'bg-jenga-500 text-dark-950 border-jenga-500' 
                                            : 'text-surface-muted border-dark-600 hover:text-jenga-500 hover:border-jenga-500'
                                        }`}
                                      >
                                        {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                    {isPinned && (
                                      <span className="block mt-1 text-[10px] font-mono tracking-widest uppercase text-jenga-500 font-black">
                                        ★ Frozen Baseline
                                      </span>
                                    )}
                                  </th>
                                );
                              })}
                          </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-dark-600">
                          <tr>
                              <td className="px-6 py-4 font-black text-surface-text uppercase tracking-widest sticky left-0 z-10 bg-dark-800 border-r-2 border-dark-700">Pricing Model</td>
                              {orderedTools.map(t => (
                                <td key={t.id} className={`px-6 py-4 ${t.id === pinnedToolId ? 'bg-dark-850 border-x-2 border-jenga-500 font-bold text-surface-text' : 'border-r border-dark-700'}`}>
                                  {t.pricing}
                                </td>
                              ))}
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-black text-surface-text uppercase tracking-widest sticky left-0 z-10 bg-dark-800 border-r-2 border-dark-700">User Rating</td>
                              {orderedTools.map(t => (
                                <td key={t.id} className={`px-6 py-4 ${t.id === pinnedToolId ? 'bg-dark-850 border-x-2 border-jenga-500' : 'border-r border-dark-700'}`}>
                                  <span className="text-jenga-500 font-black">{t.rating}</span> / 5.0
                                </td>
                              ))}
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-black text-surface-text uppercase tracking-widest sticky left-0 z-10 bg-dark-800 border-r-2 border-dark-700">Primary Category</td>
                              {orderedTools.map(t => (
                                <td key={t.id} className={`px-6 py-4 ${t.id === pinnedToolId ? 'bg-dark-850 border-x-2 border-jenga-500 text-surface-text' : 'border-r border-dark-700'}`}>
                                  {t.category}
                                </td>
                              ))}
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-black text-surface-text uppercase tracking-widest sticky left-0 z-10 bg-dark-800 border-r-2 border-dark-700">Power / Reasoning</td>
                              {orderedTools.map(t => (
                                <td key={t.id} className={`px-6 py-4 ${t.id === pinnedToolId ? 'bg-dark-850 border-x-2 border-jenga-500 font-bold' : 'border-r border-dark-700'}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-dark-950 h-2 border border-dark-600">
                                      <div className="bg-jenga-500 h-full" style={{ width: `${t.specs.power}%` }} />
                                    </div>
                                    <span>{t.specs.power}</span>
                                  </div>
                                </td>
                              ))}
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-black text-surface-text uppercase tracking-widest sticky left-0 z-10 bg-dark-800 border-r-2 border-dark-700">Ease of Use</td>
                              {orderedTools.map(t => (
                                <td key={t.id} className={`px-6 py-4 ${t.id === pinnedToolId ? 'bg-dark-850 border-x-2 border-jenga-500 font-bold' : 'border-r border-dark-700'}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-dark-950 h-2 border border-dark-600">
                                      <div className="bg-jenga-500 h-full" style={{ width: `${t.specs.easeOfUse}%` }} />
                                    </div>
                                    <span>{t.specs.easeOfUse}</span>
                                  </div>
                                </td>
                              ))}
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-black text-surface-text uppercase tracking-widest sticky left-0 z-10 bg-dark-800 border-r-2 border-dark-700">Cost Efficiency</td>
                              {orderedTools.map(t => (
                                <td key={t.id} className={`px-6 py-4 ${t.id === pinnedToolId ? 'bg-dark-850 border-x-2 border-jenga-500 font-bold' : 'border-r border-dark-700'}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-dark-950 h-2 border border-dark-600">
                                      <div className="bg-jenga-500 h-full" style={{ width: `${t.specs.costEfficiency}%` }} />
                                    </div>
                                    <span>{t.specs.costEfficiency}</span>
                                  </div>
                                </td>
                              ))}
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-black text-surface-text uppercase tracking-widest sticky left-0 z-10 bg-dark-800 border-r-2 border-dark-700">Integration Ecosystem</td>
                              {orderedTools.map(t => (
                                <td key={t.id} className={`px-6 py-4 ${t.id === pinnedToolId ? 'bg-dark-850 border-x-2 border-jenga-500 font-bold' : 'border-r border-dark-700'}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-dark-950 h-2 border border-dark-600">
                                      <div className="bg-jenga-500 h-full" style={{ width: `${t.specs.integration}%` }} />
                                    </div>
                                    <span>{t.specs.integration}</span>
                                  </div>
                                </td>
                              ))}
                          </tr>
                          <tr>
                              <td className="px-6 py-4 font-black text-surface-text uppercase tracking-widest sticky left-0 z-10 bg-dark-800 border-r-2 border-dark-700">Key Tags</td>
                              {orderedTools.map(t => (
                                <td key={t.id} className={`px-6 py-4 ${t.id === pinnedToolId ? 'bg-dark-850 border-x-2 border-jenga-500' : 'border-r border-dark-700'}`}>
                                  <div className="flex flex-wrap gap-1">
                                    {t.tags.map(tag => (
                                      <span key={tag} className="text-[10px] bg-dark-700 text-surface-muted px-1.5 py-0.5 border border-dark-600 uppercase">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              ))}
                          </tr>
                      </tbody>
                  </table>
                </div>
            </div>
        </motion.div>

        {/* Selection & Quick Add Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
            <div className="bg-dark-900 p-4 rounded-none border-4 border-dark-600 shadow-[4px_4px_0px_0px_rgba(255,140,0,1)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-surface-text font-black uppercase tracking-widest">
                    Selected ({selectedTools.length}/5)
                  </h3>
                  {selectedTools.length > 0 && (
                    <button
                      onClick={() => { setSelectedTools([]); setPinnedToolId(null); }}
                      className="text-xs font-mono text-surface-muted hover:text-red-500 uppercase tracking-widest"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {warningMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 p-2 bg-red-950/80 border border-red-500 text-red-400 text-xs font-mono flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{warningMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                    {orderedTools.map(tool => {
                      const isPinned = tool.id === pinnedToolId;
                      return (
                        <div 
                          key={tool.id} 
                          className={`flex items-center justify-between p-3 rounded-none border-2 transition-all ${
                            isPinned ? 'bg-dark-850 border-jenga-500' : 'bg-dark-800 border-dark-600'
                          }`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <button
                                  onClick={() => handleTogglePin(tool.id)}
                                  title={isPinned ? "Unfreeze" : "Freeze as baseline"}
                                  className={`p-1 border transition-colors ${
                                    isPinned ? 'bg-jenga-500 text-dark-950 border-jenga-500' : 'text-surface-muted border-dark-600 hover:text-jenga-500'
                                  }`}
                                >
                                  <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                                </button>
                                <div className="truncate">
                                  <p className="text-surface-text font-black uppercase tracking-widest text-xs truncate">{tool.name}</p>
                                  <p className="text-[10px] text-surface-muted font-mono">{tool.category}</p>
                                </div>
                            </div>
                            <button 
                              onClick={() => handleToggleCompare(tool)} 
                              className="text-surface-muted hover:text-red-500 p-1"
                              title="Remove tool"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                      );
                    })}
                    {selectedTools.length === 0 && (
                        <p className="text-sm text-surface-muted italic font-mono py-4 text-center">No tools selected yet.</p>
                    )}
                </div>
            </div>

            {/* Quick Filter & Add Tools */}
            <div className="space-y-3">
              <h3 className="text-surface-text font-black uppercase tracking-widest">Add Tools to Compare</h3>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-surface-muted" />
                <input
                  type="text"
                  placeholder="Filter available tools..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-dark-800 border-2 border-dark-600 pl-9 pr-3 py-2 text-xs font-mono text-surface-text placeholder-surface-muted focus:outline-none focus:border-jenga-500 uppercase tracking-widest"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                {['All', ToolCategory.LLM, ToolCategory.AGENT, ToolCategory.DEV].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest border transition-colors ${
                      categoryFilter === cat ? 'bg-jenga-500 text-dark-950 font-black border-jenga-500' : 'bg-dark-800 text-surface-muted border-dark-600 hover:border-jenga-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredRegistry.map(tool => {
                       const isSelected = selectedTools.some(t => t.id === tool.id);
                       return (
                         <div 
                            key={tool.id} 
                            onClick={() => handleToggleCompare(tool)}
                            className={`p-3 rounded-none border-2 cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                ? 'bg-dark-900 border-jenga-500 opacity-60'
                                : 'bg-dark-800 border-dark-600 hover:border-jenga-500 shadow-[2px_2px_0px_0px_rgba(255,140,0,1)] hover:translate-x-0.5 hover:-translate-y-0.5'
                            }`}
                         >
                            <div className="min-w-0 pr-2">
                                <p className="text-xs font-black text-surface-text uppercase tracking-widest truncate">{tool.name}</p>
                                <p className="text-[10px] text-surface-muted font-mono">{tool.category} • {tool.pricing}</p>
                            </div>
                            <div className="flex-shrink-0">
                              {isSelected ? (
                                <span className="w-5 h-5 bg-jenga-500 text-dark-950 flex items-center justify-center font-bold text-xs">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-jenga-500 uppercase font-black">+ Add</span>
                              )}
                            </div>
                         </div>
                       );
                  })}
                  {filteredRegistry.length === 0 && (
                    <p className="text-xs text-surface-muted font-mono text-center py-6">No matching tools found.</p>
                  )}
              </div>
            </div>
        </motion.div>
      </div>
    </div>
    </PageWrapper>
  );
};
