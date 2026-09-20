import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Brain, Database, BookOpen, Video, Sparkles, Trash2, Volume2, Mic } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useVoiceTutor } from '../hooks/useVoiceTutor';
import { MicButton, VoicePlaybackControls, VoiceSettingsToolbar } from '../components/VoiceTutorControls';

const starters = [
  'Explain Linear Regression and how it works',
  'What is Neural Networks and Deep Learning?',
  'Explain Naive Bayes algorithm with an example',
  'Compare Classification vs Clustering',
  'How to perform Data Preprocessing and EDA?',
  'What is RAG (Retrieval-Augmented Generation)?',
];

export default function TutorPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);
  const chatEndRef = useRef(null);

  const {
    sttSupported,
    ttsSupported,
    voiceState,
    micStatus,
    error,
    autoSpeak,
    speakingMessageId,
    speakingRate,
    availableVoices,
    selectedVoiceIndex,
    startListening,
    stopListening,
    speakAnswer,
    stopSpeaking,
    setAutoSpeak,
    setSpeakingRate,
    setSelectedVoiceIndex,
    clearError,
  } = useVoiceTutor();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleStartVoiceInput = () => {
    startListening((transcribedText) => {
      setQuestion(transcribedText);
    });
  };

  const ask = async (text, isVoiceInput = false) => {
    if (!text.trim() || loading) return;
    
    // Stop recording if active
    if (voiceState === 'listening') {
      stopListening();
    }

    const prompt = text.trim();
    setMessages(prev => [...prev, { role: 'user', text: prompt, askedByVoice: isVoiceInput }]);
    setQuestion('');
    setLoading(true);

    try {
      const data = await apiFetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt }),
      });

      setMeta({ mode: data.mode, topic: data.topic, retrieved: data.retrieved || [], related: data.related_resources || {} });
      
      const answerText = data.answer || 'No answer generated.';
      const newAssistantMsgId = Date.now();

      setMessages(prev => [
        ...prev,
        { id: newAssistantMsgId, role: 'assistant', text: answerText }
      ]);

      // Auto-read response if autoSpeak enabled or if asked by voice
      if (ttsSupported && (autoSpeak || isVoiceInput)) {
        setTimeout(() => {
          speakAnswer(newAssistantMsgId, answerText);
        }, 300);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'assistant', text: err.message || 'Unable to get AI answer. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    stopSpeaking();
    stopListening();
    setMessages([]);
    setMeta(null);
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-cyan-400" />
            <h1 className="font-display font-bold text-2xl text-white">AI Voice & Text Tutor Assistant</h1>
          </div>
          <p className="text-slate-400 text-sm">Ask any question by voice or text about AI, Machine Learning, Deep Learning, math, datasets, or Python implementation.</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="btn-cyber text-xs flex items-center gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 self-start sm:self-auto"
          >
            <Trash2 size={13} /> Clear Chat
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <VoiceSettingsToolbar
              autoSpeak={autoSpeak}
              onToggleAutoSpeak={setAutoSpeak}
              availableVoices={availableVoices}
              selectedVoiceIndex={selectedVoiceIndex}
              onSelectVoice={setSelectedVoiceIndex}
              error={error}
              onClearError={clearError}
            />

            <div className="text-xs text-slate-400 font-mono mb-2 uppercase tracking-wider">Suggested Questions</div>
            <div className="flex flex-wrap gap-2 mb-5">
              {starters.map(s => (
                <button key={s} type="button" className="btn-cyber text-xs" onClick={() => ask(s)} disabled={loading}>
                  {s}
                </button>
              ))}
            </div>

            <div className="space-y-4 mb-4 min-h-[350px] max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center py-16 text-slate-500 text-sm space-y-3">
                  <Brain size={38} className="mx-auto text-cyan-400/60 mb-2 animate-pulse" />
                  <div className="text-slate-300 font-medium text-base">Ask your Voice AI Tutor anything!</div>
                  <div className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                    Type your question below or click the <span className="text-cyan-400 font-mono">Microphone 🎤</span> button to speak naturally. Click the <span className="text-cyan-400 font-mono">Speaker 🔊</span> icon on any answer to listen.
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 ml-8'
                      : 'bg-slate-800/90 border border-slate-700/60 text-slate-100 mr-2 shadow-lg'
                  }`}
                >
                  <div className="text-[11px] font-mono uppercase tracking-wider mb-2 opacity-70 flex items-center justify-between text-cyan-400">
                    <span className="flex items-center gap-1.5">
                      {m.role === 'user' ? '👤 You' : '🤖 AI Tutor'}
                      {m.askedByVoice && <span className="text-[10px] text-rose-400 lowercase font-sans bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">via voice</span>}
                    </span>
                  </div>

                  {m.text}

                  {/* Audio playback controls for AI response */}
                  {m.role === 'assistant' && (
                    <VoicePlaybackControls
                      messageId={m.id || i}
                      messageText={m.text}
                      speakingMessageId={speakingMessageId}
                      voiceState={voiceState}
                      ttsSupported={ttsSupported}
                      onSpeak={speakAnswer}
                      onStop={stopSpeaking}
                      speakingRate={speakingRate}
                      onRateChange={setSpeakingRate}
                    />
                  )}
                </div>
              ))}

              {loading && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 text-cyan-400 text-sm animate-pulse flex items-center gap-2">
                  <Brain size={16} className="animate-spin text-cyan-400" /> Thinking and generating comprehensive answer...
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const wasVoice = voiceState === 'listening' || micStatus === 'listening';
              ask(question, wasVoice);
            }}
            className="flex items-center gap-2 pt-3 border-t border-white/10"
          >
            <input
              className="cyber-input flex-1"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={
                voiceState === 'listening'
                  ? 'Listening to your voice...'
                  : 'Ask any question or click 🎤 to speak...'
              }
              disabled={loading}
            />

            {/* Microphone Voice-to-Text Button */}
            <MicButton
              voiceState={voiceState}
              micStatus={micStatus}
              sttSupported={sttSupported}
              onStartListening={handleStartVoiceInput}
              onStopListening={stopListening}
              disabled={loading}
            />

            <button
              type="submit"
              className="btn-cyber-solid flex items-center gap-2 min-w-[90px] justify-center"
              disabled={loading || !question.trim()}
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="text-xs text-slate-500 mb-2 uppercase font-mono">Tutor Engine Mode</div>
            <div className="flex items-center gap-2 text-white font-medium">
              <Brain size={16} className="text-cyan-400" />
              {meta?.mode ? meta.mode.toUpperCase() : 'AI VOICE TUTOR READY'}
            </div>
            {meta?.topic && <div className="text-xs text-slate-400 mt-2">Detected Topic: <span className="text-cyan-400 font-semibold uppercase">{meta.topic}</span></div>}
          </div>

          <div className="glass-card p-4">
            <div className="text-xs text-slate-500 mb-3 uppercase font-mono">Retrieved Knowledge Context</div>
            <div className="space-y-2 max-h-56 overflow-auto">
              {(meta?.retrieved || []).length ? meta.retrieved.slice(0, 5).map((item, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-[11px] text-cyan-400 uppercase font-mono">{item.kind} · {item.topic}</div>
                  <div className="text-xs text-slate-300 mt-1">{item.text}</div>
                </div>
              )) : <div className="text-slate-500 text-sm">Ask a question to load topic context.</div>}
            </div>
          </div>

          <div className="glass-card p-4 space-y-3">
            <div className="text-xs text-slate-500 uppercase font-mono">Related Topic Resources</div>
            {meta?.related?.videos?.[0] && <a href={meta.related.videos[0].url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400"><Video size={14} className="text-red-400" />{meta.related.videos[0].title}</a>}
            {meta?.related?.courses?.[0] && <a href={meta.related.courses[0].url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400"><BookOpen size={14} className="text-cyan-400" />{meta.related.courses[0].title}</a>}
            {meta?.related?.datasets?.[0] && <a href={meta.related.datasets[0].url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400"><Database size={14} className="text-green-400" />{meta.related.datasets[0].title}</a>}
            {meta?.related?.project && <div className="text-xs text-slate-400 border-t border-white/10 pt-2">Project Idea: <span className="text-slate-300">{meta.related.project}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
