import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  User,
  Calculator,
  RotateCcw,
  Bot,
  Radio
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { api } from '../../services/api';
import { ChatMessage } from '../../types/finance';

const QUICK_PROMPTS = [
  'Can I afford a bike worth ₹1,20,000?',
  'How much should I save monthly on ₹95,000 salary?',
  'Should I choose SIP or FD for 3 years?',
  'Should I prepay my car loan early or invest in index funds?',
  'What is the ideal emergency fund for my lifestyle?',
];

export const FinancialCoach: React.FC = () => {
  const { userProfile, assets, transactions } = useFinance();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello ${userProfile.name}! I'm Priya Sharma, your FinGuard AI Financial Safety Coach. I have active context of your ₹${userProfile.monthlyIncome.toLocaleString('en-IN')} income, liquidity reserves, and FinGuard safety metrics. Ask me any question or simulate big purchase decisions!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Clean up any ongoing speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop active speech playback
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  // On-demand Voice Speech Synthesis (Text to Speech)
  const toggleSpeakMessage = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    // If already speaking this message, toggle off
    if (speakingMessageId === msgId) {
      stopSpeaking();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Clean text: transform currency, markdown, bullets, and symbols for natural phonetic readout
    const cleanText = text
      .replace(/₹\s*([0-9,]+)/g, '$1 rupees ')
      .replace(/₹/g, ' rupees ')
      .replace(/[*_#`~>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechSpeed;
    utterance.pitch = 1.0;

    // Pick pleasant English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.lang === 'en-IN' || v.lang === 'en-US' || v.lang.startsWith('en')) && v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setSpeakingMessageId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Top-right Master Voice Button: speaks latest advisor message or stops current speech
  const handleMasterVoiceToggle = () => {
    if (speakingMessageId) {
      stopSpeaking();
      return;
    }

    // Find the latest assistant message
    const latestAssistantMsg = [...messages].reverse().find((m) => m.sender === 'assistant');
    if (latestAssistantMsg) {
      toggleSpeakMessage(latestAssistantMsg.id, latestAssistantMsg.text);
    } else {
      toggleSpeakMessage('welcome-1', messages[0]?.text || 'Hello, I am your FinGuard AI Financial Coach.');
    }
  };

  // Voice Recognition (Speech to Text)
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    if (speakingMessageId) {
      stopSpeaking();
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendCoachMessage(query, messages, userProfile);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toISOString(),
        calculations: res.calculations,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          sender: 'assistant',
          text: 'I encountered an error connecting to the financial engine. Please try asking again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Voice-First AI Financial Guardian</span>
            <span aria-hidden="true">·</span>
            <span>Speech-to-Text &amp; Voice Wave</span>
            <span aria-hidden="true">·</span>
            <span>CFP Certified Guidelines</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            AI Financial Coach & Voice Assistant
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Top-Right Voice Controller Button */}
          <button
            onClick={handleMasterVoiceToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-xs ${
              speakingMessageId
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/30 animate-pulse'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-600'
            }`}
            title={speakingMessageId ? 'Audio currently playing. Click to stop.' : 'Click to hear the latest advice read aloud.'}
          >
            {speakingMessageId ? (
              <>
                <VolumeX className="w-4 h-4 text-white" />
                <span className="font-semibold">Stop Voice</span>
                <span className="flex gap-0.5 items-end h-3 ml-0.5">
                  <span className="w-0.5 h-2 bg-white animate-bounce" />
                  <span className="w-0.5 h-3 bg-white animate-bounce" style={{ animationDelay: '120ms' }} />
                  <span className="w-0.5 h-1.5 bg-white animate-bounce" style={{ animationDelay: '240ms' }} />
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-blue-500" />
                <span>Voice Readout</span>
              </>
            )}
          </button>

          {/* Voice speed selector */}
          <button
            onClick={() => setSpeechSpeed((prev) => (prev === 1.0 ? 1.2 : prev === 1.2 ? 0.9 : 1.0))}
            className="px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Speech Playback Speed"
          >
            {speechSpeed}x
          </button>

          <button
            onClick={() => {
              stopSpeaking();
              setMessages([
                {
                  id: 'welcome-restart',
                  sender: 'assistant',
                  text: `Hello ${userProfile.name}! Chat refreshed with latest portfolio data. How can I assist your financial planning today?`,
                  timestamp: new Date().toISOString(),
                },
              ]);
            }}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Interface Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Advisor Profile Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-center">
            <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-blue-500 shadow-md">
              <img
                src="/src/assets/images/avatar_financial_advisor_1794414559312.jpg"
                alt="AI Advisor"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Priya Sharma, CFP
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Chief AI Financial Safety Coach
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>SEBI Aligned</span>
                <span aria-hidden="true">·</span>
                <span>Safety First Wealth</span>
              </div>
            </div>

            {/* Active User Context Snapshot */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Financial Profile
              </span>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Monthly Income</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-white font-medium">
                  ₹{userProfile.monthlyIncome.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Monthly Expenses</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-white font-medium">
                  ₹{userProfile.monthlyExpenses.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Emergency Buffer</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-white font-medium">
                  ₹{userProfile.emergencyFund?.toLocaleString('en-IN') || '2,50,000'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Questions Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Suggested Questions
            </h4>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Stream Window (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative">
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="space-y-2">
                    {msg.text.split('\n\n').map((block, bIdx) => {
                      if (block.startsWith('### ') || block.startsWith('#### ')) {
                        const cleanHeader = block.replace(/^#+\s*/, '');
                        return (
                          <h4 key={bIdx} className="font-bold text-xs uppercase tracking-wider text-blue-400 mt-2 mb-0.5">
                            {cleanHeader}
                          </h4>
                        );
                      }
                      return (
                        <p key={bIdx} className="whitespace-pre-wrap leading-relaxed">
                          {block}
                        </p>
                      );
                    })}
                  </div>

                  {/* Calculations & Metrics breakdown if generated */}
                  {msg.calculations && msg.calculations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
                      {msg.calculations.map((calc, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800"
                        >
                          <span className="text-[10px] text-slate-500 block">{calc.label}</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                            {calc.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Footer: Voice Readout Trigger for Assistant & Timestamp */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    {msg.sender === 'assistant' ? (
                      <button
                        type="button"
                        onClick={() => toggleSpeakMessage(msg.id, msg.text)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                          speakingMessageId === msg.id
                            ? 'bg-blue-600 text-white shadow-xs animate-pulse ring-2 ring-blue-400/40'
                            : 'bg-white/80 dark:bg-slate-900/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60'
                        }`}
                        title={
                          speakingMessageId === msg.id
                            ? 'Click to stop audio readout'
                            : 'Click to hear Coach Priya read this message aloud'
                        }
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span className="font-semibold">Stop Voice</span>
                            <span className="flex gap-0.5 items-end h-3 ml-1">
                              <span className="w-0.5 h-2 bg-white animate-bounce" />
                              <span
                                className="w-0.5 h-3 bg-white animate-bounce"
                                style={{ animationDelay: '100ms' }}
                              />
                              <span
                                className="w-0.5 h-1.5 bg-white animate-bounce"
                                style={{ animationDelay: '200ms' }}
                              />
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen to Voice</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-blue-200">User Query</span>
                    )}

                    <span
                      className={`text-[10px] ${
                        msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-slate-400">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span>Coach Priya is evaluating your calculations...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Animated Listening Sound Wave Banner when mic is active */}
          {isListening && (
            <div className="mb-3 p-3 bg-red-950/70 border border-red-500/50 rounded-xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-white">Listening to your voice... Speak clearly</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-red-400 animate-bounce" />
                <span className="w-1 h-6 bg-red-400 animate-bounce" style={{ animationDelay: '100ms' }} />
                <span className="w-1 h-4 bg-red-400 animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-1 h-7 bg-red-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="w-1 h-2 bg-red-400 animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}

          {/* Input & Voice Controls Bar */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Click to speak query'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. 'Can I buy a ₹1.2L bike?' or 'SIP vs FD comparison'..."
                className="flex-1 p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
