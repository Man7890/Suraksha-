/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  BrainCircuit, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Habitation, SafeSite } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface SurakshaAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  habitations: Habitation[];
  safeSites: SafeSite[];
  calculatedRisks: Record<string, any>;
  simulationScenario: any;
}

export const SurakshaAIAssistant: React.FC<SurakshaAIAssistantProps> = ({
  isOpen,
  onClose,
  habitations,
  safeSites,
  calculatedRisks,
  simulationScenario,
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello, I am **Suraksha AI**, your geospatial disaster-risk and relocation intelligence assistant.\n\nI have continuous context of all ${habitations.length} mapped habitations, ${safeSites.length} alternative safe sites, and active simulations.\n\n**Quick Inquiries you can ask me:**\n• "Which habitations require immediate relocation in Wayanad?"\n• "Why is Mundakkai classified as Critical risk?"\n• "What infrastructure bottlenecks constrain Kalpetta Plateau?"\n• "Generate an Executive District Relocation Summary for Chamoli"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build context payload
      const contextData = {
        habitations: habitations.map((h) => ({
          name: h.name,
          district: h.district,
          state: h.state,
          primaryHazard: h.primaryHazard,
          secondaryHazards: h.secondaryHazards,
          calculatedRisk: calculatedRisks[h.id]?.score || 50,
          riskTier: calculatedRisks[h.id]?.classification || 'Moderate',
          vulnerabilityPct: calculatedRisks[h.id]?.vulnerablePct || 0,
          demographics: h.demographics,
          roadConnectivity: h.roadConnectivity,
          historicalIncidents: h.historicalIncidents,
        })),
        safeSites: safeSites.map((s) => ({
          name: s.name,
          district: s.district,
          state: s.state,
          availableLandAreaHa: s.availableLandAreaHa,
          existingPopulation: s.existingPopulation,
          safeAdditionalCapacity: s.waterCapacityPersons - s.existingPopulation,
          limitingFactor: 'Water Supply',
          infrastructureGaps: s.infrastructureGaps,
        })),
        simulation: simulationScenario,
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, contextData }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('[Suraksha AI Chat Error]', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `**System Notice:** Could not reach the server API. Based on standard calculations, critical habitations require immediate SDMA review.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'Which habitations have Critical risk?',
    'Why is Mundakkai in danger?',
    'What bottlenecks exist at Kalpetta Plateau?',
    'Generate District Relocation Summary',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
      <div className="bg-slate-900 border border-cyan-800/80 rounded-2xl w-full max-w-2xl h-[650px] max-h-[92vh] shadow-2xl flex flex-col my-auto text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-900/60 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Suraksha AI Intelligence Assistant</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold">
                  Gemini Flash Decision Agent
                </span>
              </div>
              <p className="text-xs text-cyan-200/80">
                Evidence-based answers grounded in multi-hazard assessments and carrying capacity models.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-500 shrink-0 font-medium">Quick chips:</span>
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="shrink-0 px-2.5 py-1 bg-slate-900 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-700 text-slate-300 rounded-full border border-slate-800 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 shadow ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                <div className="text-[12px] leading-relaxed">{m.text}</div>

                <div
                  className={`flex items-center justify-between pt-1 text-[10px] ${
                    m.sender === 'user' ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {m.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(m.id, m.text)}
                      className="hover:text-slate-300 p-0.5 rounded"
                      title="Copy text"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs p-2 bg-cyan-950/30 rounded-xl w-fit border border-cyan-800/40 animate-pulse">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Suraksha AI analyzing hazard and capacity datasets...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about high-risk villages, carrying capacities, or disaster trends..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold transition-all shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
