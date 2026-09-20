import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase, MessageSquare, Play, Sparkles, CheckCircle2, XCircle,
  AlertTriangle, RotateCcw, Lightbulb, Clock, Target, Award,
  ChevronRight, Star, Code, ArrowRight, ShieldCheck,
  Brain, Send, Eye, RefreshCw, Cpu, Check, Zap
} from 'lucide-react';
import {
  INTERVIEW_GOALS,
  getSelectedGoal,
  setSelectedGoal,
  getGoalMetadata,
  getInterviewQuestionsForGoal,
  getInterviewQuestionsForTopic,
  evaluateUserAnswer,
  evaluateUserAnswerAsync,
  fetchInterviewContext,
  runInterviewCode,
  saveInterviewSession
} from '../services/interviewService';

export default function InterviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeGoalId, setActiveGoalId] = useState(getSelectedGoal());
  const [goalMeta, setGoalMeta] = useState(getGoalMetadata(activeGoalId));
  
  // Navigation View: 'dashboard' | 'session' | 'report'
  const [view, setView] = useState('dashboard');

  // Active Topic Filter
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Interview Session Setup State
  const [interviewMode, setInterviewMode] = useState('technical'); // 'technical' | 'rapid' | 'conceptual' | 'scenario' | 'coding' | 'mock'
  const [difficulty, setDifficulty] = useState('Intermediate'); // 'Beginner' | 'Intermediate' | 'Advanced'
  const [questionCount, setQuestionCount] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(20);

  // Active Session State
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userTextAnswer, setUserTextAnswer] = useState('');
  const [userCode, setUserCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('java');
  const [unlockedHintLevel, setUnlockedHintLevel] = useState(0); // 0 = none, 1 = hint1, 2 = hint2, 3 = full
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [codeExecutionResult, setCodeExecutionResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [sessionTimer, setSessionTimer] = useState(1200); // in seconds

  useEffect(() => {
    const goalParam = searchParams.get('goal');
    const topicParam = searchParams.get('topic');

    let currentGoal = activeGoalId;
    if (goalParam && INTERVIEW_GOALS[goalParam]) {
      currentGoal = goalParam;
      setSelectedGoal(goalParam);
    } else {
      currentGoal = getSelectedGoal();
    }
    setActiveGoalId(currentGoal);
    setGoalMeta(getGoalMetadata(currentGoal));

    // If topic parameter is passed directly, immediately start interview on that topic
    if (topicParam) {
      startInterviewForTopic(topicParam, 'technical', currentGoal);
    }
  }, [searchParams]);

  const handleSwitchGoal = (newGoalId) => {
    setSelectedGoal(newGoalId);
    setActiveGoalId(newGoalId);
    setGoalMeta(getGoalMetadata(newGoalId));
    setSelectedTopic(null);
    setView('dashboard');
  };

  // Safely compute the weakest topic for daily challenge & alerts
  const weakTopicName =
    (goalMeta?.topics && goalMeta.topics.length > 0 ? goalMeta.topics[goalMeta.topics.length - 1] : null) ||
    (goalMeta?.readinessTopics && goalMeta.readinessTopics.length > 0 ? goalMeta.readinessTopics[goalMeta.readinessTopics.length - 1]?.name : null) ||
    'Model Evaluation';

  // Launch interview immediately for a specific selected topic
  const startInterviewForTopic = (topicName, mode = 'technical', customGoalId = null) => {
    const targetGoal = customGoalId || activeGoalId || 'placement';
    const cleanTopic = topicName || goalMeta?.topics?.[0] || 'Python';
    setSelectedTopic(cleanTopic);
    setInterviewMode(mode);
    let questions = getInterviewQuestionsForTopic(cleanTopic, targetGoal, difficulty);
    if (!questions || questions.length === 0) {
      questions = getInterviewQuestionsForGoal(targetGoal, 'all', 'all');
    }
    if (!questions || questions.length === 0) {
      questions = [
        {
          id: `q-fallback-${Date.now()}`,
          title: `${cleanTopic}: Core Concepts & System Architecture`,
          topic: cleanTopic,
          difficulty: 'Intermediate',
          type: 'conceptual',
          question: `Explain the fundamental concepts, practical mechanics, and trade-offs of ${cleanTopic}.`,
          hints: [
            `Hint 1: Outline what ${cleanTopic} does and why it is important.`,
            `Hint 2: Mention key formulas, architectures, or hyper-parameters.`
          ],
          idealKeyPoints: [
            `Core definition and purpose of ${cleanTopic}.`,
            `Key advantages and limitations.`,
            `Practical production considerations.`
          ],
          explanation: `${cleanTopic} is a key topic in this machine learning domain.`
        }
      ];
    }
    const count = mode === 'conceptual' || mode === 'rapid' ? 1 : Math.max(1, questionCount || 3);
    const sliced = questions.slice(0, count);
    setSessionQuestions(sliced);
    setCurrentQIndex(0);
    setUserTextAnswer('');
    setUserCode(sliced[0]?.starterCode?.[codeLanguage] || '');
    setUnlockedHintLevel(0);
    setEvaluationResult(null);
    setCodeExecutionResult(null);
    setSessionAnswers([]);
    setSessionTimer((durationMinutes || 20) * 60);
    setView('session');
  };

  const startInterviewSession = (mode) => {
    setSelectedTopic(null);
    setInterviewMode(mode);
    let questions = getInterviewQuestionsForGoal(activeGoalId, difficulty, mode === 'coding' ? 'coding' : 'all');
    if (!questions || questions.length === 0) {
      questions = getInterviewQuestionsForGoal(activeGoalId, 'all', 'all');
    }
    const count = mode === 'conceptual' || mode === 'rapid' ? 1 : Math.max(1, questionCount || 3);
    const sliced = questions.slice(0, count);
    setSessionQuestions(sliced);
    setCurrentQIndex(0);
    setUserTextAnswer('');
    setUserCode(sliced[0]?.starterCode?.[codeLanguage] || '');
    setUnlockedHintLevel(0);
    setEvaluationResult(null);
    setCodeExecutionResult(null);
    setSessionAnswers([]);
    setSessionTimer((durationMinutes || 20) * 60);
    setView('session');
  };

  const handleEvaluateAnswer = async () => {
    const currentQ = sessionQuestions[currentQIndex];
    if (!currentQ) return;
    setIsEvaluating(true);

    try {
      if (currentQ.type === 'coding') {
        const codeRes = runInterviewCode({
          code: userCode,
          language: codeLanguage,
          testCases: currentQ.testCases
        });
        setCodeExecutionResult(codeRes);
        const evalRes = {
          score: codeRes.success ? 90 : 45,
          verdict: codeRes.success ? 'Accepted & Optimal' : 'Tests Failed',
          isSatisfactory: codeRes.success,
          feedback: codeRes.success ? 'Code execution succeeded with optimal time complexity.' : 'Code failed test cases. Check edge cases and return types.',
          matchedKeyPoints: codeRes.success ? ['Code compiled', 'Passed test suite'] : [],
          missedKeyPoints: codeRes.success ? [] : ['Handle edge inputs']
        };
        setEvaluationResult(evalRes);
        setSessionAnswers(prev => [...prev, { question: currentQ, answer: userCode, isCoding: true, evaluation: evalRes }]);
      } else {
        const evalRes = await evaluateUserAnswerAsync({
          question: currentQ,
          userAnswer: userTextAnswer
        });
        setEvaluationResult(evalRes);
        setSessionAnswers(prev => [...prev, { question: currentQ, answer: userTextAnswer, isCoding: false, evaluation: evalRes }]);
      }
    } catch (err) {
      console.warn('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < sessionQuestions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setUserTextAnswer('');
      setUserCode(sessionQuestions[nextIdx]?.starterCode?.[codeLanguage] || '');
      setUnlockedHintLevel(0);
      setEvaluationResult(null);
      setCodeExecutionResult(null);
    } else {
      // Complete Session & Show Report
      const totalScore = Math.round(
        sessionAnswers.reduce((acc, curr) => acc + (curr.evaluation?.score || 50), 0) / Math.max(1, sessionAnswers.length)
      );
      saveInterviewSession({
        goal: activeGoalId,
        goalTitle: goalMeta.title,
        mode: interviewMode,
        score: totalScore,
        totalQuestions: sessionQuestions.length,
        answers: sessionAnswers
      });
      setView('report');
    }
  };

  const currentQ = sessionQuestions[currentQIndex];

  return (
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* ── Top Header & Dynamic Goal Detection Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              DYNAMIC INTERVIEW PREPARATION
            </span>
            <span className="text-xs font-mono text-slate-400">Adaptive AI Evaluation Engine</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mt-1 flex items-center gap-3">
            <Briefcase className="text-cyan-400" /> AI/ML Interview – <span className="text-cyan-300">{goalMeta.title}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Personalized technical interview simulator aligned with your active learning goal. Practice conceptual depth, scenario questions, and live coding with real-time AI critique.
          </p>
        </div>

        {/* Goal Switcher Dropdown */}
        <div className="glass-card p-2 flex items-center gap-2 self-start md:self-auto border border-white/10">
          <span className="text-xs font-mono text-slate-400 pl-2">Active Track:</span>
          <select
            value={activeGoalId}
            onChange={(e) => handleSwitchGoal(e.target.value)}
            className="cyber-input text-xs py-1 px-2.5 font-medium text-cyan-300 cursor-pointer"
          >
            {Object.entries(INTERVIEW_GOALS).map(([id, g]) => (
              <option key={id} value={id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          VIEW 1: INTERVIEW READINESS DASHBOARD & MODES
      ════════════════════════════════════════════════════════ */}
      {view === 'dashboard' && (
        <div className="space-y-8">
          {/* ── 1. Readiness Metrics Summary Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 space-y-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Target Track</span>
              <div className="text-xl font-display font-bold text-white">{goalMeta.title}</div>
              <div className="text-xs text-cyan-400 font-mono">{goalMeta.subtitle}</div>
            </div>

            <div className="glass-card p-5 space-y-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Overall Interview Readiness</span>
              <div className="text-2xl font-display font-bold text-emerald-400">72% Ready</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            <div className="glass-card p-5 space-y-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Questions Attempted</span>
              <div className="text-2xl font-display font-bold text-cyan-400">18 Answered</div>
              <div className="text-xs text-slate-400">82% Positive AI Evaluations</div>
            </div>

            <div className="glass-card p-5 space-y-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Weak Topic Alert</span>
              <div className="text-lg font-display font-semibold text-rose-400 truncate">
                {weakTopicName}
              </div>
              <div className="text-xs text-slate-400 font-mono">Revision Drill Recommended</div>
            </div>
          </div>

          {/* ── 2. Instant Topic Interview Launcher ── */}
          <div className="glass-card p-6 space-y-4 border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900 to-purple-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Zap className="text-cyan-400" size={18} /> Instant Topic Interview
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Click any topic below to <strong>immediately start an AI interview</strong> asking questions specifically on that topic.
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                1-Click Topic Interview
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(goalMeta?.topics || []).map((topicName, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => startInterviewForTopic(topicName, 'technical')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40 text-xs font-mono font-medium transition-all hover:scale-105 flex items-center gap-1.5 shadow-sm group"
                >
                  <Target size={12} className="text-cyan-400 group-hover:animate-pulse" />
                  <span>{topicName}</span>
                  <ArrowRight size={12} className="opacity-40 group-hover:opacity-100 text-cyan-400 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* ── 3. Daily Interview Challenge Banner ── */}
          <div className="glass-card-strong p-6 bg-gradient-to-r from-amber-950/30 via-purple-950/20 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-mono text-amber-400 font-bold uppercase">DAILY INTERVIEW CHALLENGE</div>
                <h3 className="text-white font-display font-bold text-base mt-0.5">
                  Strengthen: {weakTopicName}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Complete 1 quick diagnostic interview question today to raise your readiness score.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startInterviewForTopic(weakTopicName, 'conceptual')}
              className="btn-cyber-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 shrink-0 shadow-lg shadow-amber-950/40"
            >
              Start Daily Challenge <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          VIEW 2: LIVE ADAPTIVE INTERVIEW SESSION
      ════════════════════════════════════════════════════════ */}
      {view === 'session' && currentQ && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Session Progress Bar */}
          <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-cyan-400 font-bold">
                QUESTION {currentQIndex + 1} OF {sessionQuestions.length}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                <Target size={12} className="text-cyan-400" /> Focus Topic: {selectedTopic || currentQ.topic}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                {currentQ.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Switch Topic:</span>
                <select
                  value={selectedTopic || currentQ.topic || ''}
                  onChange={(e) => startInterviewForTopic(e.target.value, interviewMode)}
                  className="cyber-input text-[11px] py-1 px-2 text-cyan-300"
                >
                  {(goalMeta.topics || []).map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setView('dashboard')}
                className="text-slate-400 hover:text-rose-400 text-xs pl-2 border-l border-white/10"
              >
                Exit Session
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Question, Hints, and Input */}
            <div className="lg:col-span-7 glass-card p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-display font-bold text-white leading-snug">
                    {currentQ.question}
                  </h2>
                  <button
                    onClick={() => toggleBookmark(currentQ.id)}
                    className={`p-1.5 rounded-lg border transition ${bookmarkedIds.has(currentQ.id) ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-white/5 text-slate-500 border-white/10'}`}
                    title="Bookmark Question"
                  >
                    <Bookmark size={15} />
                  </button>
                </div>

                {/* ── Progressive Hint Box ── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono flex items-center gap-1.5">
                      <Lightbulb size={13} className="text-amber-400" /> Need guidance?
                    </span>
                    {unlockedHintLevel < (currentQ.hints?.length || 0) && (
                      <button
                        onClick={() => setUnlockedHintLevel(prev => prev + 1)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        + Unlock Progressive Hint {unlockedHintLevel + 1}
                      </button>
                    )}
                  </div>

                  {unlockedHintLevel > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 space-y-1.5 font-mono animate-fadeIn">
                      <div className="font-bold text-amber-400">Hint {unlockedHintLevel}:</div>
                      <div>{currentQ.hints[unlockedHintLevel - 1]}</div>
                    </div>
                  )}
                </div>

                {/* ── Answer Input: Text Area OR Code Editor ── */}
                {currentQ.type === 'coding' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Language:</span>
                      <select
                        value={codeLanguage}
                        onChange={(e) => {
                          setCodeLanguage(e.target.value);
                          setUserCode(currentQ.starterCode?.[e.target.value] || currentQ.starterCode?.java);
                        }}
                        className="cyber-input text-xs py-1 px-2.5"
                      >
                        <option value="java">Java (Primary)</option>
                        <option value="python">Python 3</option>
                      </select>
                    </div>

                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="cyber-input w-full h-64 font-mono text-xs p-4 leading-relaxed resize-none"
                      placeholder="// Write code implementation..."
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-slate-400">YOUR RESPONSE:</div>
                    <textarea
                      value={userTextAnswer}
                      onChange={(e) => setUserTextAnswer(e.target.value)}
                      className="cyber-input w-full h-44 text-xs font-sans leading-relaxed p-4 resize-none"
                      placeholder="Type your structured technical response here (e.g. explain core principles, formulas, tradeoffs, and examples)..."
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => navigate('/tutor', { state: { initialPrompt: `Can you explain the key concepts for this interview question: "${currentQ.question}"?` } })}
                  className="btn-cyber text-xs py-2 px-3 text-purple-300 flex items-center gap-1.5"
                >
                  <Brain size={14} /> Discuss with Tutor
                </button>

                <div className="flex items-center gap-2">
                  {!evaluationResult ? (
                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluating || (currentQ.type === 'coding' ? !userCode.trim() : !userTextAnswer.trim())}
                      className="btn-cyber-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/30"
                    >
                      <Sparkles size={14} className={isEvaluating ? 'animate-spin' : ''} />
                      {isEvaluating ? 'Evaluating with AI...' : 'Submit Response'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="btn-cyber-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500"
                    >
                      {currentQIndex < sessionQuestions.length - 1 ? 'Next Question' : 'View Full Report'} <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 cols: AI Evaluation Critique & Missing Points */}
            <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between space-y-4">
              {evaluationResult ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                      <Sparkles size={14} /> AI EVALUATION CRITIQUE
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${evaluationResult.score >= 75 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                      {evaluationResult.score}% Score · {evaluationResult.verdict}
                    </span>
                  </div>

                  {/* Constructive Feedback */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 leading-relaxed">
                    <div className="font-semibold text-white mb-1">Feedback Summary:</div>
                    {evaluationResult.feedback}
                  </div>

                  {/* Matched Points */}
                  {evaluationResult.matchedKeyPoints.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Points Well Explained:
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                        {evaluationResult.matchedKeyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Crucial Points */}
                  {evaluationResult.missedKeyPoints.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono text-rose-400 uppercase font-bold flex items-center gap-1">
                        <AlertTriangle size={13} /> Missing Key Concepts to Include:
                      </div>
                      <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                        {evaluationResult.missedKeyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-mono italic pt-2 border-t border-white/5">
                    *Feedback is automatically generated by AI to help identify knowledge gaps.
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-slate-500 p-6 space-y-2">
                  <Brain size={36} className="text-slate-600 mb-1" />
                  <div className="text-sm font-semibold text-slate-400">AI Evaluation Ready</div>
                  <div className="text-xs max-w-xs">
                    Type your answer on the left and submit. The AI system will critique technical depth, clarity, and missing principles.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          VIEW 3: POST-INTERVIEW DIAGNOSTIC REPORT
      ════════════════════════════════════════════════════════ */}
      {view === 'report' && (
        <div className="glass-card p-6 md:p-8 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">SESSION COMPLETE</span>
              <h2 className="text-2xl font-display font-bold text-white mt-1">Interview Diagnostic Report</h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">Track: {goalMeta.title}</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('dashboard')}
                className="btn-cyber text-xs py-2 px-4"
              >
                Back to Readiness Dashboard
              </button>
              <button
                onClick={() => startInterviewSession(interviewMode)}
                className="btn-cyber-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Retake / New Session
              </button>
            </div>
          </div>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 font-mono uppercase">Overall Accuracy</div>
              <div className="text-3xl font-display font-bold text-emerald-400">
                {Math.round(sessionAnswers.reduce((acc, curr) => acc + (curr.evaluation?.score || 50), 0) / Math.max(1, sessionAnswers.length))}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 font-mono uppercase">Questions Evaluated</div>
              <div className="text-3xl font-display font-bold text-cyan-400">{sessionAnswers.length} Questions</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 font-mono uppercase">Readiness Impact</div>
              <div className="text-3xl font-display font-bold text-purple-400">+4% Lift</div>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Question by Question Review</h3>
            <div className="space-y-3">
              {sessionAnswers.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Q{idx + 1}: {item.question.title}</span>
                    <span className="font-mono text-cyan-400 font-bold">{item.evaluation?.score || 0}% Score</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg font-sans">
                    💡 <strong className="text-white">AI Feedback:</strong> {item.evaluation?.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
