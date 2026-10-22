'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Bot,
  X,
  PhoneCall,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Send,
  HelpCircle
} from 'lucide-react';
import LeadCaptureForm from './LeadCaptureForm';

// In-memory cache to prevent redundant fetches on client-side page navigation
let cachedConfig = null;

export default function FloatingWidgets() {
  const [config, setConfig] = useState(cachedConfig);
  const [activeModal, setActiveModal] = useState(null); // 'contact' | 'chatbot' | null
  const [chatMessages, setChatMessages] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch configuration on client mount
  useEffect(() => {
    let isMounted = true;
    async function loadWidgetConfig() {
      if (cachedConfig) {
        setConfig(cachedConfig);
        return;
      }
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.provokeplaytech.com/api/v1';
        const res = await fetch(`${API_URL}/floating-widgets/config`, {
          // Keep payload ultra-fast and cached
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            cachedConfig = json.data;
            if (isMounted) setConfig(json.data);
          }
        }
      } catch (e) {
        console.error('Failed to load floating widgets config:', e);
      }
    }
    loadWidgetConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Chatbot when opened
  useEffect(() => {
    if (activeModal === 'chatbot' && config?.chatbot) {
      if (chatMessages.length === 0) {
        const rootOptions = config.chatbot.flow?.[0]?.options || [];
        setChatMessages([
          {
            id: 'init-msg',
            sender: 'bot',
            text: config.chatbot.welcome_message || 'Hi there! 👋 How can we help you today?'
          }
        ]);
        setCurrentOptions(rootOptions);
      }
    }
  }, [activeModal, config, chatMessages.length]);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (activeModal === 'chatbot') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, currentOptions, activeModal]);

  // Close modal on Escape or outside click
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setActiveModal(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!config) return null;

  const contactEnabled = Boolean(config.contact_form?.enabled);
  const chatbotEnabled = Boolean(config.chatbot?.enabled);

  // If both are disabled by admin, render nothing
  if (!contactEnabled && !chatbotEnabled) return null;

  const shakeDuration = config.contact_form?.shake_interval_seconds || 6;

  const resetChat = () => {
    const rootOptions = config.chatbot?.flow?.[0]?.options || [];
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: config.chatbot?.welcome_message || 'Hi there! 👋 How can we help you today?'
      }
    ]);
    setCurrentOptions(rootOptions);
  };

  const handleOptionClick = (option) => {
    // 1. Append user selected bubble
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: option.label
    };

    // 2. Determine bot reply
    const botMsg = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot',
      text: option.response_message || 'Here is what you need:',
      link: option.action_type === 'link' ? option.url : null,
      isLeadForm: option.action_type === 'lead_form'
    };

    setChatMessages((prev) => [...prev, userMsg, botMsg]);

    // 3. Update next selectable options
    if (option.action_type === 'message' && option.next_options?.length > 0) {
      setCurrentOptions(option.next_options);
    } else {
      setCurrentOptions([]);
    }
  };

  const toggleModal = (modalType) => {
    setActiveModal((prev) => (prev === modalType ? null : modalType));
  };

  return (
    <>
      {/* Small In-Place Modal (shrink / expand directly above the buttons) */}
      <div
        ref={modalRef}
        aria-hidden={!activeModal}
        style={{ zIndex: 9999 }}
        className={`fixed bottom-24 right-5 z-[9999] w-[360px] sm:w-[390px] max-w-[calc(100vw-32px)] max-h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden origin-bottom-right transition-all duration-200 ease-out ${
          activeModal
            ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto'
            : 'scale-75 opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {/* Contact Form Modal View */}
        {activeModal === 'contact' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-sky-600 to-cyan-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <PhoneCall size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">
                    {config.contact_form?.title || 'Quick Inquiry'}
                  </h3>
                  <p className="text-[11px] text-white/80 mt-1 line-clamp-1">
                    {config.contact_form?.subtitle || 'Leave your details and requirement'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-4 overflow-y-auto max-h-[480px]">
              <LeadCaptureForm
                compact={true}
                source="floating_widget"
                onSuccess={() => {
                  // Keep open so customer sees confirmation
                }}
              />
            </div>
          </div>
        )}

        {/* Chatbot Modal View */}
        {activeModal === 'chatbot' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-600 to-sky-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-base">
                    🤖
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">
                    {config.chatbot?.bot_name || 'ToyWorld Assistant'}
                  </h3>
                  <span className="text-[10px] text-white/80 mt-0.5 block">
                    {config.chatbot?.bot_subtitle || 'Online • Instant Answers'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
                  title="Start Over"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/70 text-xs max-h-[340px]">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Hyperlink Button inside Chat */}
                    {msg.link && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        {msg.link.startsWith('/') ? (
                          <Link
                            href={msg.link}
                            onClick={() => setActiveModal(null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-[11px] transition"
                          >
                            <span>Open Page</span>
                            <ExternalLink size={12} />
                          </Link>
                        ) : (
                          <a
                            href={msg.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-[11px] transition"
                          >
                            <span>Visit Link</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Trigger Contact Form Button inside Chat */}
                    {msg.isLeadForm && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setActiveModal('contact')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-[11px] transition shadow-sm"
                        >
                          <PhoneCall size={12} />
                          <span>Open Contact Form</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Selectable Options Area */}
            <div className="p-3 bg-white border-t border-slate-100 shrink-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select an Option:
                </span>
                {currentOptions.length === 0 && (
                  <button
                    type="button"
                    onClick={resetChat}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw size={11} /> Main Menu
                  </button>
                )}
              </div>

              {currentOptions.length > 0 ? (
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                  {currentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleOptionClick(opt)}
                      className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-indigo-50/80 hover:border-indigo-300 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 transition flex items-center justify-between group active:scale-[0.99]"
                    >
                      <span className="truncate">{opt.label}</span>
                      <ChevronRight
                        size={14}
                        className="text-slate-400 group-hover:text-indigo-600 shrink-0 transition"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-[11px] text-slate-400">Need something else?</p>
                  <button
                    type="button"
                    onClick={resetChat}
                    className="mt-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    ↩️ Return to Main Menu
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons at bottom right */}
      <div
        style={{ zIndex: 9990 }}
        className="fixed bottom-5 right-5 z-[9990] flex flex-col items-end gap-3 pointer-events-none select-none"
      >
        {/* 1. Floating Contact Form Button (Lead Collection) */}
        {contactEnabled && (
          <div
            className={`relative group pointer-events-auto transition-all duration-200 ${
              activeModal === 'chatbot' ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            {/* Tooltip */}
            <div className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition duration-150">
              {config.contact_form?.button_tooltip || 'Quick Inquiry'}
            </div>

            <button
              type="button"
              onClick={() => toggleModal('contact')}
              style={{
                '--wiggle-duration': `${shakeDuration}s`,
                backgroundColor: config.contact_form?.button_color || '#0284c7'
              }}
              className={`w-13 h-13 sm:w-14 sm:h-14 w-[52px] h-[52px] rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer ${
                activeModal === 'contact'
                  ? 'ring-4 ring-sky-300'
                  : !activeModal
                  ? 'animate-widget-wiggle'
                  : ''
              }`}
              title="Quick Contact / Lead Form"
              aria-label="Open contact form"
            >
              {activeModal === 'contact' ? (
                <X size={22} className="transition-transform duration-200 rotate-90" />
              ) : (
                <PhoneCall size={22} className="transition-transform duration-200" />
              )}
            </button>
          </div>
        )}

        {/* 2. Floating Chatbot Button */}
        {chatbotEnabled && (
          <div
            className={`relative group pointer-events-auto transition-all duration-200 ${
              activeModal === 'contact' ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            {/* Tooltip */}
            <div className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition duration-150">
              {config.chatbot?.button_tooltip || 'Chat with Us'}
            </div>

            <button
              type="button"
              onClick={() => toggleModal('chatbot')}
              style={{
                backgroundColor: config.chatbot?.button_color || '#4f46e5'
              }}
              className={`w-13 h-13 sm:w-14 sm:h-14 w-[52px] h-[52px] rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer relative ${
                activeModal === 'chatbot' ? 'ring-4 ring-indigo-300' : ''
              }`}
              title="Chatbot"
              aria-label="Open chatbot"
            >
              {activeModal === 'chatbot' ? (
                <X size={22} className="transition-transform duration-200 rotate-90" />
              ) : (
                <>
                  <Bot size={24} />
                  {/* Live Pulse Indicator Dot */}
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
