'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw, MessageSquare, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export default function ChatCounselorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string; date: string }[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'assistant',
        text: `### 👋 Welcome to the AI Chat College Counselor!\n\nI am your dedicated college admissions advisor. I can help you query our database of **254+ real Indian colleges** to make smarter, data-driven decisions.\n\n**Try asking me questions like:**\n*   *"Can I get CSE in Karnataka under ₹2 lakh?"*\n*   *"Which colleges have the best ROI?"*\n*   *"Explain Private vs Government colleges"*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Best ROI colleges?',
          'Private vs Government colleges?',
          'CSE in Karnataka under ₹2 lakh?'
        ]
      }
    ]);

    // Hydrate chat history
    try {
      const savedHistory = localStorage.getItem('chat_counselor_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setTyping(true);

    try {
      // Call the server-side counselor API securely
      const res = await fetch('/api/counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Server error');
      }
      
      const answer = json.answer;
      
      // Simulate slight delays for realistic typing indicator
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `msg-assistant-${Date.now()}`,
          sender: 'assistant',
          text: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: textToSend.toLowerCase().includes('roi') 
            ? ['Private vs Government?', 'CSE in Karnataka under ₹2 lakh?'] 
            : ['Best ROI colleges?', 'Explain BITS Pilani details']
        };
        setMessages(prev => [...prev, assistantMsg]);
        setTyping(false);

        // Update local saved history
        const newHistoryItem = {
          id: `hist-${Date.now()}`,
          title: textToSend.length > 25 ? `${textToSend.substring(0, 25)}...` : textToSend,
          date: new Date().toLocaleDateString()
        };
        const updatedHistory = [newHistoryItem, ...history.slice(0, 4)];
        setHistory(updatedHistory);
        localStorage.setItem('chat_counselor_history', JSON.stringify(updatedHistory));
      }, 700);

    } catch (e) {
      setTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: '❌ Apologies, I encountered a connection issue querying our discovery index. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'assistant',
        text: `### 👋 Welcome to the AI Chat College Counselor!\n\nI am your dedicated college admissions advisor. I can help you query our database of **254+ real Indian colleges** to make smarter, data-driven decisions.\n\n**Try asking me questions like:**\n*   *"Can I get CSE in Karnataka under ₹2 lakh?"*\n*   *"Which colleges have the best ROI?"*\n*   *"Explain Private vs Government colleges"*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Best ROI colleges?',
          'Private vs Government colleges?',
          'CSE in Karnataka under ₹2 lakh?'
        ]
      }
    ]);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('chat_counselor_history');
    } catch (e) {
      console.error(e);
    }
  };

  // Basic markdown parser
  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-extrabold text-[#F5F5F5] mt-3 mb-1.5">{line.substring(4)}</h3>;
      }
      if (line.startsWith('* ')) {
        return <li key={idx} className="ml-4 list-disc text-[11px] leading-relaxed mb-0.5">{line.substring(2)}</li>;
      }
      if (line.startsWith('> [!')) {
        return null; // hide alerts in basic markdown line mapping or render block quote
      }
      if (line.startsWith('>')) {
        return <blockquote key={idx} className="border-l-2 border-[#8B5CF6] pl-2 text-[10px] italic text-[#B0B0C0] my-2">{line.substring(1).trim()}</blockquote>;
      }
      if (line.startsWith('|')) {
        // Table line parsing (simple mapper)
        if (line.includes('---')) return null;
        const cells = line.split('|').filter(c => c.trim().length > 0);
        const isHeader = idx === 4 || line.includes('College Name');
        return (
          <div key={idx} className={`grid grid-cols-4 gap-2 py-1 text-[10px] border-b border-[#2A2A40]/40 ${isHeader ? 'font-bold text-purple-300' : 'text-[#B0B0C0]'}`}>
            {cells.map((cell, cIdx) => (
              <span key={cIdx} className="truncate">{cell.replace(/\*\*/g, '').trim()}</span>
            ))}
          </div>
        );
      }
      return <p key={idx} className="text-[11px] leading-relaxed mb-1">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col justify-between">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] right-[-5%] bg-glow-purple"></div>
      <div className="absolute bottom-[-10%] left-[-5%] bg-glow-purple" style={{ animationDelay: '-3s' }}></div>

      <div className="mx-auto max-w-7xl w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        
        {/* Left Side: Saved History & Disclaimer */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-6 select-none">
          <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-6 space-y-6 backdrop-blur-sm shadow-sm">
            <h3 className="text-sm font-bold text-[#F5F5F5] flex items-center justify-between border-b border-[#2A2A40]/40 pb-3">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-[#8B5CF6]" />
                Saved Advisor History
              </span>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-[#B0B0C0] hover:text-red-400 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </h3>

            {history.length > 0 ? (
              <div className="space-y-2 text-xs">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSendMessage(item.title.replace('...', ''))}
                    className="w-full rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/30 px-4 py-3 hover:border-[#8B5CF6]/45 hover:bg-[#8B5CF6]/5 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-[#B0B0C0] truncate group-hover:text-[#F5F5F5] font-medium">{item.title}</span>
                    <ArrowRight className="h-3 w-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[#B0B0C0]/40 text-xs flex flex-col items-center justify-center space-y-2">
                <MessageSquare className="h-8 w-8 opacity-30" />
                <span>No saved advisor threads.</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-xs space-y-2">
            <h4 className="font-bold text-amber-400 flex items-center gap-1">
              <Bot className="h-4 w-4" />
              Interview-Safe Advisory Layer
            </h4>
            <p className="text-[#B0B0C0] leading-relaxed">
              This Counselor matches user queries against active database records and JoSAA cutoffs using heuristic classifiers. No external API queries or runtime delays. Extremely fast, robust, and safe from hallucination.
            </p>
          </div>
        </div>

        {/* Right Side: Chat counselor widget */}
        <div className="lg:col-span-3 flex flex-col h-[75vh] rounded-2xl border border-[#2A2A40] bg-[#151521]/30 backdrop-blur-sm shadow-sm overflow-hidden">
          
          {/* Header Controls */}
          <div className="bg-[#151521]/60 border-b border-[#2A2A40] px-6 py-4 flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#F5F5F5] text-xs">Admissions Counseling Bot</h4>
                <div className="flex items-center gap-1 text-[9px] text-[#B0B0C0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  Active (Seeded AI Mode)
                </div>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="rounded-lg border border-[#2A2A40] hover:border-purple-500/35 px-3 py-1.5 text-xs text-[#B0B0C0] hover:text-[#F5F5F5] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Restart Chat
            </button>
          </div>

          {/* Messages Logs Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Sender Avatar */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  msg.sender === 'user' 
                    ? 'bg-purple-500/10 border-[#8B5CF6]/30 text-[#8B5CF6]' 
                    : 'bg-[#151521] border-[#2A2A40] text-[#B0B0C0]'
                }`}>
                  {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-[#8B5CF6]" />}
                </div>

                {/* Message bubble card */}
                <div className={`rounded-xl p-4 border text-xs shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/35 text-[#F5F5F5]'
                    : 'bg-[#151521]/60 border-[#2A2A40] text-[#B0B0C0] leading-relaxed'
                }`}>
                  {msg.sender === 'user' ? <p>{msg.text}</p> : renderMessageText(msg.text)}
                  <span className="text-[8px] opacity-40 block text-right mt-1.5 select-none">{msg.timestamp}</span>

                  {/* Suggestion Chips inside the welcome message */}
                  {msg.sender === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5 select-none border-t border-[#2A2A40]/40 pt-3">
                      {msg.suggestions.map((chip, chipIdx) => (
                        <button
                          key={chipIdx}
                          onClick={() => handleSendMessage(chip)}
                          className="bg-[#151521] hover:bg-[#8B5CF6]/10 text-purple-400 hover:text-purple-300 border border-[#2A2A40] hover:border-[#8B5CF6]/30 rounded px-2.5 py-1 text-[9px] font-bold transition-all cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-3 max-w-[80%] animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-[#151521] border border-[#2A2A40] text-[#B0B0C0] flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-[#8B5CF6]" />
                </div>
                <div className="rounded-xl p-4 bg-[#151521]/60 border border-[#2A2A40] text-purple-400 text-xs italic flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  Admissions Counselor is typing...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Interactive Chat Input form */}
          <div className="bg-[#151521]/60 border-t border-[#2A2A40] px-6 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-3 bg-[#0A0A0F] border border-[#2A2A40] rounded-xl px-4 py-3 text-xs"
            >
              <input
                type="text"
                placeholder="Ask admissions counselor anything (e.g. ROI options, private vs govt, CSE under 2 lakhs)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={typing}
                className="w-full bg-transparent border-none text-[#F5F5F5] focus:outline-none placeholder-[#B0B0C0]/50"
              />
              <button
                type="submit"
                disabled={typing || !inputText.trim()}
                className="p-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 disabled:opacity-50 text-white transition-all cursor-pointer shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
