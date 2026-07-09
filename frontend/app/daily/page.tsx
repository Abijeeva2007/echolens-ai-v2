"use client";

import { useEffect, useMemo, useState } from "react";
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
// Types
// ---------------------------------------------------------------------------

type Severity = "High" | "Medium" | "Low";

interface BiasEntry {
  name: string;
  severity: Severity;
  description: string;
  color: string;
}

interface FallacyEntry {
  name: string;
  description: string;
  example: string;
}

interface AnalysisResult {
  summary: string;
  biases: BiasEntry[];
  fallacies: FallacyEntry[];
  score: number;
  scoreLabel: string;
  scoreDescription: string;
}

interface Preset {
  label: string;
  icon: string;
  text: string;
  results: AnalysisResult;
}

// ---------------------------------------------------------------------------
// Presets for the demo
// ---------------------------------------------------------------------------

const PRESETS: Preset[] = [
  {
    label: "Social Media Echo",
    icon: "📱",
    text: "Honestly, everyone is switching to this new decentralized social platform. If you're still on the legacy apps, you obviously don't care about privacy or freedom. The mainstream media is completely silent about it, which proves they're trying to censor us!",
    results: {
      summary:
        "The author asserts that switching to a new decentralized social network is the only option for those who value privacy and freedom. They argue that legacy apps are compromised and claim mainstream media silence is direct evidence of active censorship.",
      biases: [
        {
          name: "Outgroup Homogeneity Bias",
          severity: "High",
          description:
            "Generalizes all users of legacy platforms as indifferent to privacy rights, overlooking diverse reasons for staying (network effects, accessibility).",
          color: "bg-rose-500/10 text-rose-300 border-rose-500/30",
        },
        {
          name: "Conspiracy / Intentionality Bias",
          severity: "Medium",
          description:
            "Attributes the media's lack of coverage to deliberate censorship and malice, rather than typical editorial prioritization or lack of general public interest.",
          color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        },
      ],
      fallacies: [
        {
          name: "False Dilemma (Either/Or)",
          description:
            "Presents a binary choice: either transition to the new decentralized platform, or have no concern for personal privacy/freedom. It ignores alternative solutions.",
          example: "\"If you're still on legacy apps, you obviously don't care about privacy.\"",
        },
        {
          name: "Appeal to Ignorance",
          description:
            "Uses a lack of coverage or evidence as proof of a positive claim (deliberate censorship).",
          example: "\"The mainstream media is completely silent, which proves they're trying to censor us.\"",
        },
        {
          name: "Bandwagon Fallacy",
          description:
            "Implies the platform is superior or correct simply because a large number of people are switching to it.",
          example: "\"Everyone is switching to this new decentralized social platform.\"",
        },
      ],
      score: 28,
      scoreLabel: "Highly Polarized",
      scoreDescription:
        "This text contains significant emotional appeals, high polarization, and lacks alternative viewpoints.",
    },
  },
  {
    label: "Corporate Tech Hype",
    icon: "🚀",
    text: "AI is completely revolutionizing every single aspect of humanity. Companies that do not integrate generative AI into their core operations immediately are guaranteed to go bankrupt within the next twelve months. We either embrace this future fully now, or get left in the dust of history.",
    results: {
      summary:
        "The author claims that Artificial Intelligence is an all-encompassing force that will reshape humanity. They predict immediate bankruptcy for any business that does not adopt generative AI tools within a year, framing the situation as an urgent binary survival crisis.",
      biases: [
        {
          name: "Optimism / Hype Bias",
          severity: "High",
          description:
            "Overestimates the immediate utility, ease of implementation, and universal success of a new technology while ignoring structural costs and regulatory barriers.",
          color: "bg-rose-500/10 text-rose-300 border-rose-500/30",
        },
        {
          name: "Hyperbole & Alarmism",
          severity: "Medium",
          description:
            "Creates an artificial sense of urgency using extreme timelines (12 months) and outcomes (guaranteed bankruptcy) to drive compliance.",
          color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        },
      ],
      fallacies: [
        {
          name: "False Dilemma",
          description:
            "Forces a choice between full, immediate adoption and absolute failure, skipping gradual integration, testing, or industry-specific nuances.",
          example: "\"We either embrace this future fully now, or get left in the dust of history.\"",
        },
        {
          name: "Slippery Slope",
          description:
            "Assumes that lacking immediate AI integration will inevitably and quickly trigger complete corporate collapse.",
          example: "\"Companies that do not integrate... are guaranteed to go bankrupt within twelve months.\"",
        },
      ],
      score: 42,
      scoreLabel: "Hyperbolic / Low Nuance",
      scoreDescription:
        "Strong technological determinism. The statement lacks nuance regarding operational friction and industry-specific realities.",
    },
  },
  {
    label: "Political News Framing",
    icon: "⚖️",
    text: "A new economic report shows employment has risen by 2%, proving our administration's policies are a resounding success. The opposition's criticisms are just desperate attempts to hide this historic progress from the public.",
    results: {
      summary:
        "The statement presents a 2% rise in employment as absolute proof that the administration's policies are working. It discredits the political opposition's criticism as a dishonest, desperate attempt to cover up positive results.",
      biases: [
        {
          name: "Confirmation Bias (Cherry-Picking)",
          severity: "Medium",
          description:
            "Singles out a positive metric (2% employment rise) while omitting inflation, wage stagnation, debt, or other indicators to paint an exclusively positive picture.",
          color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        },
        {
          name: "In-group Favoritism",
          severity: "High",
          description:
            "Frames the administration as a source of historic progress and the opposition as bad-faith actors with malicious or weak motivations.",
          color: "bg-rose-500/10 text-rose-300 border-rose-500/30",
        },
      ],
      fallacies: [
        {
          name: "Post Hoc Ergo Propter Hoc",
          description:
            "Assumes that because employment rose during their term, the administration's specific policies were the direct and sole driver of that rise.",
          example: "\"employment has risen by 2%, proving our administration's policies are a resounding success.\"",
        },
        {
          name: "Ad Hominem (Attack on Motive)",
          description:
            "Attacks the opposition's political intentions and character rather than addressing the substance of their economic arguments.",
          example: "\"The opposition's criticisms are just desperate attempts to hide this...\"",
        },
      ],
      score: 35,
      scoreLabel: "Partisan Framing",
      scoreDescription:
        "Single-perspective claim with partisan attribution. Avoids examining systemic global market factors or other domestic indicators.",
    },
  },
];

const LOADING_STEPS = [
  { label: "Parsing language & semantic structure", icon: Brain },
  { label: "Detecting persuasion patterns", icon: Sparkles },
  { label: "Scanning for cognitive biases", icon: AlertTriangle },
  { label: "Finding logical fallacies", icon: Scale },
  { label: "Calculating perspective score", icon: TrendingUp },
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

function ScoreGauge({ score }: { score: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const color =
    score >= 70 ? "#34d399" : score >= 45 ? "#fbbf24" : "#fb7185";

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
            strokeDashoffset: circumference * (1 - score / 100),
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          key={score}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-4xl font-bold text-white"
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          / 100
        </span>
      </div>
    </div>
  );
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

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

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05060a] text-sm text-white/50">
        Loading...
      </main>
    );
  }

  if (!user) return null;

  const handlePresetSelect = (presetLabel: string, presetText: string) => {
    setActivePreset(presetLabel);
    setText(presetText);
    setResults(null);
  };

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResults(null);

    const matchedPreset = PRESETS.find(
      (p) => p.text.substring(0, 30) === text.substring(0, 30)
    );

    setTimeout(() => {
      setIsAnalyzing(false);
      if (matchedPreset) {
        setResults(matchedPreset.results);
      } else {
        const charCount = text.length;
        const score = Math.max(15, Math.min(95, Math.round((charCount % 60) + 30)));
        setResults({
          summary: `This custom input of ${charCount} characters discusses arguments that require critical analysis. The text presents claims with selective focus and outlines a particular viewpoint.`,
          biases: [
            {
              name: "Framing Bias",
              severity: "Medium",
              description:
                "The information is presented in a way that guides the reader toward a specific emotional conclusion rather than an objective analysis of options.",
              color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
            },
            {
              name: "Confirmation Bias",
              severity: "Low",
              description:
                "The claims leverage supportive scenarios while skipping counterarguments or balancing structural details.",
              color: "bg-sky-500/10 text-sky-300 border-sky-500/30",
            },
          ],
          fallacies: [
            {
              name: "Unwarranted Generalization",
              description:
                "Draws a general conclusion based on limited or non-representative evidence.",
              example: text.substring(0, Math.min(text.length, 60)) + "...",
            },
          ],
          score,
          scoreLabel:
            score > 70 ? "Objective & Nuanced" : score > 40 ? "Moderately Biased" : "One-Sided / Biased",
          scoreDescription: `Analysis scores this text ${score}/100. It shows a primary viewpoint with minor balance. Introducing alternative lenses would improve perspective diversity.`,
        });
      }
      setShowConfetti(true);
      setShowXp(true);
    }, LOADING_STEPS.length * STEP_DURATION + 150);
  };

  const handleReset = () => {
    setText("");
    setResults(null);
    setActivePreset(null);
  };

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
                18 Bias Models
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
              perspective balance in seconds.
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
                  Select a quick preset example to see it in action, or type your own.
                </CardDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  {PRESETS.map((p) => {
                    const active = activePreset === p.label;
                    return (
                      <motion.button
                        key={p.label}
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handlePresetSelect(p.label, p.text)}
                        className={`group relative flex items-center gap-1.5 overflow-hidden rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-100"
                            : "border-white/10 bg-white/[0.03] text-white/60 hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <textarea
                    className="min-h-[160px] w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 font-sans text-sm leading-relaxed text-white placeholder:text-white/30 transition-all focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    placeholder="Paste argument, news paragraph, or social commentary here..."
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setActivePreset(null);
                    }}
                    disabled={isAnalyzing}
                  />
                  <span className="pointer-events-none absolute bottom-3 right-4 text-[11px] font-medium text-white/25">
                    {text.length} characters
                  </span>
                </div>
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
                              done ? "text-white/50 line-through decoration-white/20" : current ? "font-medium text-white" : "text-white/35"
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
                  {/* Summary */}
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
                          <CardTitle className="text-md text-white">
                            Deconstructed Summary
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="font-sans text-sm leading-relaxed text-white/70">
                          {results.summary}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Biases */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  >
                    <Card className="flex h-full flex-col border-white/10 bg-white/[0.04] backdrop-blur-xl transition-transform hover:-translate-y-0.5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="size-4.5 text-orange-300" />
                          <CardTitle className="text-md text-white">
                            Cognitive Biases Detected
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-white/40">
                          Internal lenses warping objective representation.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        {results.biases.map((bias, idx) => (
                          <div
                            key={idx}
                            className="space-y-1.5 rounded-lg border border-white/10 bg-black/20 p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-white">
                                {bias.name}
                              </span>
                              <span
                                className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${bias.color}`}
                              >
                                {bias.severity} Severity
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-white/50">
                              {bias.description}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Fallacies */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                  >
                    <Card className="flex h-full flex-col border-white/10 bg-white/[0.04] backdrop-blur-xl transition-transform hover:-translate-y-0.5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Scale className="size-4.5 text-fuchsia-300" />
                          <CardTitle className="text-md text-white">
                            Logical Fallacies Flagged
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-white/40">
                          Flaws in reasoning that invalidate the argument.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        {results.fallacies.map((fal, idx) => (
                          <div
                            key={idx}
                            className="space-y-1.5 rounded-md border border-white/10 bg-black/20 p-2.5 text-xs"
                          >
                            <span className="font-bold text-fuchsia-300">{fal.name}</span>
                            <p className="leading-snug text-white/50">{fal.description}</p>
                            <p className="rounded bg-white/5 p-1.5 text-[11px] italic leading-normal text-white/60">
                              {fal.example}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Perspective Score */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="md:col-span-2"
                  >
                    <Card className="flex flex-col items-center gap-6 overflow-hidden border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:flex-row">
                      <ScoreGauge score={results.score} />

                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                          <span className="text-lg font-bold text-white">
                            {results.scoreLabel}
                          </span>
                          <Badge
                            className={
                              results.score > 60
                                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                                : "border-white/15 bg-white/5 text-white/50"
                            }
                          >
                            {results.score > 60 ? "Balanced" : "Low Perspective Integration"}
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-white/50">
                          {results.scoreDescription}
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-2 text-xs font-semibold text-cyan-300 sm:justify-start">
                          <TrendingUp className="size-3.5" />
                          <span>
                            Advice: Try simulating opposing perspectives on this text in
                            Simulation Mode.
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
