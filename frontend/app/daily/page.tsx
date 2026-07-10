"use client";
import { api } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  AlertTriangle,
  Scale,
  FileText,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Brain,
  Trophy,
  Zap,
  ArrowRight,
  Target,
  Smile,
  HelpCircle,
  Lightbulb,
  Globe,
  Landmark,
  Users,
  Leaf,
  FlaskConical,
  DollarSign,
  Heart,
  Copy,
  Download,
  Share2,
  BarChart3,
  Activity,
  Check,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types — mirrors the real backend response for /daily/analyze
// ---------------------------------------------------------------------------

type AnalysisResult = {
  summary: string;
  main_claim: string;
  persuasion: string[];
  biases: string[];
  missing_perspectives: string[];
  logical_fallacies: string[];
  emotion: string;
  credibility_score: number;
  confidence: number;
  questions: string[];
  recommendation: string;
};

const LOADING_STEPS = [
  { label: "🧠 Reading content...", icon: Brain },
  { label: "Detecting persuasion", icon: Sparkles },
  { label: "Finding logical fallacies", icon: Scale },
  { label: "Measuring credibility", icon: BarChart3 },
  { label: "Generating recommendations", icon: Lightbulb },
];

const STEP_DURATION = 650;

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function FloatingLights() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-indigo-600/25 blur-[110px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -right-24 h-[26rem] w-[26rem] rounded-full bg-cyan-500/20 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-[100px]"
        animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function ParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 10,
        size: 2 + Math.random() * 3,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-indigo-300/40"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            bottom: -10,
          }}
          animate={{ y: [-10, -420], opacity: [0, 0.8, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function ConfettiBurst({ show }: { show: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 520,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.15,
        color: [
          "bg-indigo-400",
          "bg-cyan-400",
          "bg-fuchsia-400",
          "bg-amber-300",
          "bg-emerald-400",
        ][i % 5],
      })),
    [show]
  );

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[60] flex justify-center">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className={`absolute h-2.5 w-1.5 rounded-sm ${piece.color}`}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: piece.x,
            y: 360 + Math.random() * 120,
            opacity: 0,
            rotate: piece.rotate,
          }}
          transition={{ duration: 1.4, delay: piece.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// Animated count-up number, used anywhere a real metric needs to tick up.
function AnimatedNumber({
  value,
  duration = 1.2,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const target = Number.isFinite(value) ? value : 0;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setDisplay(Math.round(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const color =
    clamped >= 70 ? "#34d399" : clamped >= 45 ? "#fbbf24" : "#fb7185";

  return (
    <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
      <svg className="h-40 w-40 -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="fill-none stroke-white/10"
          strokeWidth="12"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference * (1 - clamped / 100),
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-white">
          <AnimatedNumber value={clamped} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          / 100
        </span>
      </div>
    </div>
  );
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  // Backend may return confidence as 0-1 or 0-100; normalize to a percentage.
  const pct = Math.max(
    0,
    Math.min(100, confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence))
  );
  const color =
    pct >= 70 ? "from-emerald-500 to-emerald-300" : pct >= 40 ? "from-amber-500 to-amber-300" : "from-rose-500 to-rose-300";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-white/70">Model Confidence</span>
        <span className="font-bold text-white">
          <AnimatedNumber value={pct} suffix="%" />
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Emotion → visual language mapping
const EMOTION_STYLES: Record<
  string,
  { classes: string; icon: string }
> = {
  positive: { classes: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200", icon: "🙂" },
  neutral: { classes: "border-slate-400/40 bg-slate-500/10 text-slate-200", icon: "😐" },
  fear: { classes: "border-violet-400/40 bg-violet-500/10 text-violet-200", icon: "😨" },
  anger: { classes: "border-rose-400/40 bg-rose-500/10 text-rose-200", icon: "😠" },
  hope: { classes: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200", icon: "🌤" },
  confusion: { classes: "border-amber-400/40 bg-amber-500/10 text-amber-200", icon: "😕" },
};

function getEmotionStyle(emotion: string) {
  const key = emotion?.trim().toLowerCase();
  return (
    EMOTION_STYLES[key] ?? {
      classes: "border-indigo-400/40 bg-indigo-500/10 text-indigo-200",
      icon: "✨",
    }
  );
}

// Missing-perspective label → icon mapping
const PERSPECTIVE_ICONS: { match: RegExp; icon: typeof Landmark; color: string }[] = [
  { match: /govern|polic|state|regulat/i, icon: Landmark, color: "text-indigo-300" },
  { match: /citizen|public|community|people/i, icon: Users, color: "text-cyan-300" },
  { match: /econom|financ|market|cost/i, icon: DollarSign, color: "text-emerald-300" },
  { match: /environ|climate|ecolog/i, icon: Leaf, color: "text-lime-300" },
  { match: /ethic|moral/i, icon: Heart, color: "text-rose-300" },
  { match: /scien|research|data|technical/i, icon: FlaskConical, color: "text-fuchsia-300" },
];

function getPerspectiveIcon(label: string) {
  const found = PERSPECTIVE_ICONS.find((p) => p.match.test(label));
  return found ?? { icon: Globe, color: "text-white/60" };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DailyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!isAnalyzing) return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= LOADING_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    if (!showXp) return;
    const timeout = setTimeout(() => setShowXp(false), 3200);
    return () => clearTimeout(timeout);
  }, [showXp]);

  useEffect(() => {
    if (!showConfetti) return;
    const timeout = setTimeout(() => setShowConfetti(false), 1600);
    return () => clearTimeout(timeout);
  }, [showConfetti]);

  useEffect(() => {
    if (copyState !== "copied") return;
    const timeout = setTimeout(() => setCopyState("idle"), 2000);
    return () => clearTimeout(timeout);
  }, [copyState]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05060a] text-sm text-white/50">
        Loading...
      </main>
    );
  }

  if (!user) return null;

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setResults(null);
    setError(null);

    try {
      const response = (await api.dailyAnalyze({
        text,
      })) as AnalysisResult;

      setResults(response);
      setShowConfetti(true);
      setShowXp(true);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again in a moment.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setText("");
    setResults(null);
    setError(null);
  };

  const handleAnalyzeAgain = () => {
    setResults(null);
    setError(null);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const buildReportText = (r: AnalysisResult) => {
    return [
      "EchoLens AI — Critical Analysis Report",
      "========================================",
      "",
      "SUMMARY",
      r.summary || "—",
      "",
      "MAIN CLAIM",
      r.main_claim || "—",
      "",
      "EMOTIONAL TONE",
      r.emotion || "—",
      "",
      "PERSUASION TECHNIQUES",
      r.persuasion?.length ? r.persuasion.map((p) => `• ${p}`).join("\n") : "None detected",
      "",
      "COGNITIVE BIASES",
      r.biases?.length ? r.biases.map((b) => `• ${b}`).join("\n") : "None detected",
      "",
      "LOGICAL FALLACIES",
      r.logical_fallacies?.length
        ? r.logical_fallacies.map((f) => `• ${f}`).join("\n")
        : "None detected",
      "",
      "MISSING PERSPECTIVES",
      r.missing_perspectives?.length
        ? r.missing_perspectives.map((m) => `• ${m}`).join("\n")
        : "None flagged",
      "",
      `CREDIBILITY SCORE: ${r.credibility_score}/100`,
      `AI CONFIDENCE: ${r.confidence <= 1 ? Math.round(r.confidence * 100) : Math.round(r.confidence)}%`,
      "",
      "CRITICAL THINKING QUESTIONS",
      r.questions?.length ? r.questions.map((q, i) => `${i + 1}. ${q}`).join("\n") : "—",
      "",
      "RECOMMENDATION",
      r.recommendation || "—",
    ].join("\n");
  };

  const handleCopyReport = async () => {
    if (!results) return;
    try {
      await navigator.clipboard.writeText(buildReportText(results));
      setCopyState("copied");
    } catch (err) {
      console.error(err);
      alert("Could not copy report to clipboard.");
    }
  };

  const handleDownloadPdf = () => {
    if (!results) return;
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups to download the PDF report.");
      return;
    }
    const reportText = buildReportText(results).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    win.document.write(`
      <html>
        <head>
          <title>EchoLens Analysis Report</title>
          <style>
            body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; padding: 40px; color: #111; white-space: pre-wrap; line-height: 1.6; }
            h1 { font-size: 20px; }
          </style>
        </head>
        <body>${reportText}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleShare = async () => {
    if (!results) return;
    const reportText = buildReportText(results);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "EchoLens AI — Analysis Report",
          text: reportText,
        });
      } catch (err) {
        // user cancelled share sheet — no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(reportText);
        alert("Sharing isn't supported on this browser — report copied to clipboard instead.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const emotionStyle = results ? getEmotionStyle(results.emotion) : null;

  return (
    <AppShell>
      <div className="relative -m-4 min-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl bg-[#05060a] p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
        <FloatingLights />
        <ParticleField />
        <ConfettiBurst show={showConfetti} />

        {/* XP / Achievement popup */}
        <AnimatePresence>
          {showXp && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="fixed right-4 top-4 z-[70] w-72 sm:right-8 sm:top-8"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                  <Trophy className="size-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Achievement Unlocked</p>
                  <p className="truncate text-xs text-white/50">Critical Thinker · +25 XP</p>
                </div>
                <Zap className="ml-auto size-4 shrink-0 text-amber-300" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 mx-auto max-w-4xl space-y-10 py-2">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-center sm:text-left"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge className="gap-1.5 border-indigo-400/30 bg-indigo-500/10 text-indigo-200">
                <Sparkles className="size-3" />
                EchoLens Engine
              </Badge>
              <Badge className="gap-1.5 border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                <Brain className="size-3" />
                Bias & Fallacy Detection
              </Badge>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              <span className="bg-gradient-to-r from-indigo-300 via-white to-cyan-300 bg-clip-text text-transparent">
                Daily Analysis Workspace
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/50 sm:mx-0 sm:text-base">
              Paste any article, opinion, social post, or argument. EchoLens dissects its
              logical structure, surfaces latent biases, flags fallacies, and measures
              credibility in seconds.
            </p>
          </motion.section>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Input Text to Analyze</CardTitle>
                <CardDescription className="text-xs text-white/40">
                  Paste an article, post, or argument and EchoLens will break it down.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    className="min-h-[160px] w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 font-sans text-sm leading-relaxed text-white placeholder:text-white/30 transition-all focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    placeholder="Paste argument, news paragraph, or social commentary here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isAnalyzing}
                  />
                  <span className="pointer-events-none absolute bottom-3 right-4 text-[11px] font-medium text-white/25">
                    {text.length} characters
                  </span>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex flex-wrap justify-end gap-3">
                  {text && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      disabled={isAnalyzing}
                      className="cursor-pointer text-white/50 hover:bg-white/5 hover:text-white"
                    >
                      <RotateCcw className="mr-1 size-3.5" /> Clear
                    </Button>
                  )}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="sm"
                      onClick={handleAnalyze}
                      disabled={!text.trim() || isAnalyzing}
                      className="cursor-pointer gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-40"
                    >
                      <Sparkles className="size-4" />
                      {isAnalyzing ? "Analyzing..." : "Analyze Text"}
                      {!isAnalyzing && <ArrowRight className="size-3.5" />}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Thinking Timeline */}
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10"
              >
                <div className="flex flex-col items-center gap-8">
                  {/* Glowing orb */}
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 blur-md"
                      animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/40">
                      <Brain className="size-7 text-white" />
                    </div>
                    <motion.div
                      className="absolute inset-[-6px] rounded-full border border-indigo-400/40"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>

                  {/* Timeline */}
                  <div className="w-full max-w-md space-y-3">
                    {LOADING_STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const done = idx < loadingStep;
                      const current = idx === loadingStep;
                      return (
                        <motion.div
                          key={step.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: idx <= loadingStep ? 1 : 0.35, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                              done
                                ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                                : current
                                ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-200"
                                : "border-white/10 bg-white/5 text-white/30"
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="size-4" />
                            ) : (
                              <Icon className={`size-3.5 ${current ? "animate-pulse" : ""}`} />
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              done
                                ? "text-white/50 line-through decoration-white/20"
                                : current
                                ? "font-medium text-white"
                                : "text-white/35"
                            }`}
                          >
                            {step.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {results && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <CheckCircle2 className="size-5 text-emerald-400" />
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Critical Breakdown Completed
                  </h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Summary — hero card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="md:col-span-2"
                  >
                    <Card className="overflow-hidden border-white/10 border-l-4 border-l-indigo-400 bg-white/[0.04] backdrop-blur-xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4.5 text-indigo-300" />
                          <CardTitle className="text-md text-white">📰 Summary</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="font-sans text-sm leading-relaxed text-white/70">
                          {results.summary || "No summary was returned for this text."}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Main Claim — large highlighted card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="md:col-span-2"
                  >
                    <Card className="overflow-hidden border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 via-white/[0.04] to-transparent backdrop-blur-xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Target className="size-4.5 text-cyan-300" />
                          <CardTitle className="text-md text-white">🎯 Main Claim</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold leading-relaxed text-white">
                          {results.main_claim || "No central claim was identified."}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Emotional Tone — animated chip */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  >
                    <Card className="flex h-full flex-col border-white/10 bg-white/[0.04] backdrop-blur-xl transition-transform hover:-translate-y-0.5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Smile className="size-4.5 text-amber-300" />
                          <CardTitle className="text-md text-white">😊 Emotional Tone</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-1 items-center">
                        {emotionStyle && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 18 }}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${emotionStyle.classes}`}
                          >
                            <span className="text-base">{emotionStyle.icon}</span>
                            {results.emotion || "Unspecified"}
                          </motion.span>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* AI Confidence — horizontal progress bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Card className="flex h-full flex-col border-white/10 bg-white/[0.04] backdrop-blur-xl transition-transform hover:-translate-y-0.5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="size-4.5 text-cyan-300" />
                          <CardTitle className="text-md text-white">🤖 AI Confidence</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-1 items-center">
                        <div className="w-full">
                          <ConfidenceBar confidence={results.confidence} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Persuasion Techniques — animated badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                  >
                    <Card className="flex h-full flex-col border-white/10 bg-white/[0.04] backdrop-blur-xl transition-transform hover:-translate-y-0.5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4.5 text-indigo-300" />
                          <CardTitle className="text-md text-white">
                            🧠 Persuasion Techniques
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-white/40">
                          Rhetorical devices used to steer the reader.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        {results.persuasion?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {results.persuasion.map((p, idx) => (
                              <motion.span
                                key={`${p}-${idx}`}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.05 * idx }}
                                className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200"
                              >
                                {p}
                              </motion.span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40">No persuasion techniques detected.</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Cognitive Biases — animated badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Card className="flex h-full flex-col border-white/10 bg-white/[0.04] backdrop-blur-xl transition-transform hover:-translate-y-0.5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Brain className="size-4.5 text-fuchsia-300" />
                          <CardTitle className="text-md text-white">🧭 Cognitive Biases</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-white/40">
                          Mental shortcuts warping objective framing.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        {results.biases?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {results.biases.map((b, idx) => (
                              <motion.span
                                key={`${b}-${idx}`}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.05 * idx }}
                                className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-medium text-fuchsia-200"
                              >
                                {b}
                              </motion.span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40">No cognitive biases detected.</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Logical Fallacies — warning cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="md:col-span-2"
                  >
                    <Card className="border-white/10 bg-white/[0.04] backdrop-blur-xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="size-4.5 text-rose-300" />
                          <CardTitle className="text-md text-white">
                            ⚠ Logical Fallacies
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-white/40">
                          Flaws in reasoning that undermine the argument.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {results.logical_fallacies?.length ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {results.logical_fallacies.map((f, idx) => (
                              <motion.div
                                key={`${f}-${idx}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.06 * idx }}
                                className="flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-500/5 p-3"
                              >
                                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-300" />
                                <span className="text-sm leading-relaxed text-white/70">{f}</span>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40">No logical fallacies detected.</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Missing Perspectives — timeline cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="md:col-span-2"
                  >
                    <Card className="border-white/10 bg-white/[0.04] backdrop-blur-xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="size-4.5 text-sky-300" />
                          <CardTitle className="text-md text-white">
                            🌍 Missing Perspectives
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-white/40">
                          Viewpoints this text leaves out of the conversation.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {results.missing_perspectives?.length ? (
                          <div className="relative space-y-4 pl-6">
                            <div className="absolute bottom-1 left-[9px] top-1 w-px bg-white/10" />
                            {results.missing_perspectives.map((m, idx) => {
                              const { icon: Icon, color } = getPerspectiveIcon(m);
                              return (
                                <motion.div
                                  key={`${m}-${idx}`}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: 0.07 * idx }}
                                  className="relative flex items-start gap-3"
                                >
                                  <div className="absolute -left-6 flex h-[19px] w-[19px] items-center justify-center rounded-full border border-white/15 bg-[#0b0d14]">
                                    <Icon className={`size-3 ${color}`} />
                                  </div>
                                  <p className="text-sm leading-relaxed text-white/70">{m}</p>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40">No missing perspectives flagged.</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Credibility Score — circular gauge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.45 }}
                    className="md:col-span-2"
                  >
                    <Card className="flex flex-col items-center gap-6 overflow-hidden border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:flex-row">
                      <ScoreGauge score={results.credibility_score} />

                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                          <BarChart3 className="size-4 text-white/50" />
                          <span className="text-lg font-bold text-white">📊 Credibility Score</span>
                          <Badge
                            className={
                              results.credibility_score >= 70
                                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                                : results.credibility_score >= 45
                                ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                                : "border-rose-400/30 bg-rose-500/10 text-rose-300"
                            }
                          >
                            {results.credibility_score >= 70
                              ? "High Credibility"
                              : results.credibility_score >= 45
                              ? "Moderate Credibility"
                              : "Low Credibility"}
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-white/50">
                          This score reflects the overall trustworthiness of the source text based
                          on detected bias, fallacies, and perspective balance.
                        </p>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Critical Thinking Questions — numbered cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="md:col-span-2"
                  >
                    <Card className="border-white/10 bg-white/[0.04] backdrop-blur-xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="size-4.5 text-cyan-300" />
                          <CardTitle className="text-md text-white">
                            💡 Critical Thinking Questions
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-white/40">
                          Questions to probe the argument further.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {results.questions?.length ? (
                          <div className="space-y-3">
                            {results.questions.map((q, idx) => (
                              <motion.div
                                key={`${q}-${idx}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.06 * idx }}
                                className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/20 p-3"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white">
                                  {idx + 1}
                                </span>
                                <p className="text-sm leading-relaxed text-white/70">{q}</p>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40">No follow-up questions generated.</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Recommendation — gradient premium card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.55 }}
                    className="md:col-span-2"
                  >
                    <Card className="overflow-hidden border-transparent bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20 backdrop-blur-xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="size-4.5 text-amber-300" />
                          <CardTitle className="text-md text-white">✨ Recommendation</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-medium leading-relaxed text-white/90">
                          {results.recommendation || "No recommendation was returned."}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyReport}
                    className="cursor-pointer gap-1.5 text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    {copyState === "copied" ? (
                      <Check className="size-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copyState === "copied" ? "Copied" : "Copy Report"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadPdf}
                    className="cursor-pointer gap-1.5 text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    <Download className="size-3.5" />
                    Download PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="cursor-pointer gap-1.5 text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    <Share2 className="size-3.5" />
                    Share Analysis
                  </Button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="sm"
                      onClick={handleAnalyzeAgain}
                      className="cursor-pointer gap-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 font-medium text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-cyan-400"
                    >
                      <RotateCcw className="size-3.5" />
                      Analyze Again
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
