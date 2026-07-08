"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Award,
  Flame,
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
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

// Fallacy Spotter Quiz Questions
const FALLACY_QUESTIONS = [
  {
    text: "If we allow students to use AI calculators for homework, next they won't learn basic arithmetic, and then our entire financial infrastructure will collapse into absolute chaos.",
    options: ["Slippery Slope", "Ad Hominem", "Appeal to Authority", "Bandwagon"],
    answer: "Slippery Slope",
    explanation: "A Slippery Slope fallacy assumes a relatively small first step will inevitably trigger a chain of negative events, without providing logical links for that inevitability.",
  },
  {
    text: "Doctor Henderson argues that the vaccine is safe and tested. But he drives a luxury sedan and wears expensive suits, so he is clearly just writing prescriptions for corporate profits.",
    options: ["Strawman", "Ad Hominem", "False Cause", "Red Herring"],
    answer: "Ad Hominem",
    explanation: "An Ad Hominem fallacy attacks the person's character or motives rather than dealing with the substance of their logical arguments.",
  },
  {
    text: "My grandfather smoked three packs of cigarettes a day and lived to be 97 years old, so tobacco isn't actually harmful to human health.",
    options: ["Hasty Generalization", "Circular Reasoning", "False Dilemma", "Slippery Slope"],
    answer: "Hasty Generalization",
    explanation: "A Hasty Generalization draws a sweeping conclusion based on a single, non-representative anecdotal example rather than statistical data.",
  },
];

// Bias Matcher Quiz Questions
const BIAS_QUESTIONS = [
  {
    text: "I exclusively subscribe to news feeds that align with my political ideologies, and I immediately dismiss any report of government waste within my own party as fake news.",
    options: ["Confirmation Bias", "Sunk Cost Fallacy", "Framing Effect", "Availability Heuristic"],
    answer: "Confirmation Bias",
    explanation: "Confirmation Bias is the tendency to search for, interpret, and recall information in a way that confirms one's prior beliefs while dismissing conflicting data.",
  },
  {
    text: "I have already spent $4,000 repairing this older car this year. Even though it broke down again today and is worth only $2,000, I must invest another $1,500 because I've already put so much money into it.",
    options: ["Anchoring Bias", "Sunk Cost Fallacy", "Dunning-Kruger Effect", "Bandwagon Effect"],
    answer: "Sunk Cost Fallacy",
    explanation: "The Sunk Cost Fallacy is the tendency to continue investing resources (money, time) in a losing proposition simply because of previous unrecoverable investments.",
  },
  {
    text: "After watching a dramatic documentary about shark attacks on TV, I canceled my beach trip because I convinced myself that shark attacks are incredibly common and likely.",
    options: ["Availability Heuristic", "Framing Effect", "Confirmation Bias", "Hindsight Bias"],
    answer: "Availability Heuristic",
    explanation: "The Availability Heuristic is a mental shortcut that relies on immediate examples that come to mind when evaluating the frequency or safety of an event.",
  },
];

export default function LearningPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Local fake stats that increment when user answers correctly
  const [xp, setXp] = useState(1420);
  const [streak, setStreak] = useState(5);
  const [correctAnswers, setCorrectAnswers] = useState(42);

  // Fallacy Spotter Game State
  const [fallacyIdx, setFallacyIdx] = useState(0);
  const [selectedFallacyOpt, setSelectedFallacyOpt] = useState<string | null>(null);
  const [isFallacySubmitted, setIsFallacySubmitted] = useState(false);
  const [fallacyScore, setFallacyScore] = useState(0);

  // Bias Matcher Game State
  const [biasIdx, setBiasIdx] = useState(0);
  const [selectedBiasOpt, setSelectedBiasOpt] = useState<string | null>(null);
  const [isBiasSubmitted, setIsBiasSubmitted] = useState(false);
  const [biasScore, setBiasScore] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Sync initial XP from user profile once loaded
  useEffect(() => {
    if (user) {
      setXp(user.xp);
      setStreak(user.streak);
    }
  }, [user]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground bg-background">
        Loading...
      </main>
    );
  }

  if (!user) return null;

  // Fallacy Handlers
  const handleFallacySelect = (opt: string) => {
    if (isFallacySubmitted) return;
    setSelectedFallacyOpt(opt);
  };

  const handleFallacySubmit = () => {
    if (selectedFallacyOpt === null || isFallacySubmitted) return;
    setIsFallacySubmitted(true);

    const isCorrect = selectedFallacyOpt === FALLACY_QUESTIONS[fallacyIdx].answer;
    if (isCorrect) {
      setXp((prev) => prev + 20);
      setCorrectAnswers((prev) => prev + 1);
      setFallacyScore((prev) => prev + 1);
    }
  };

  const handleFallacyNext = () => {
    setSelectedFallacyOpt(null);
    setIsFallacySubmitted(false);
    setFallacyIdx((prev) => (prev + 1) % FALLACY_QUESTIONS.length);
  };

  // Bias Handlers
  const handleBiasSelect = (opt: string) => {
    if (isBiasSubmitted) return;
    setSelectedBiasOpt(opt);
  };

  const handleBiasSubmit = () => {
    if (selectedBiasOpt === null || isBiasSubmitted) return;
    setIsBiasSubmitted(true);

    const isCorrect = selectedBiasOpt === BIAS_QUESTIONS[biasIdx].answer;
    if (isCorrect) {
      setXp((prev) => prev + 20);
      setCorrectAnswers((prev) => prev + 1);
      setBiasScore((prev) => prev + 1);
    }
  };

  const handleBiasNext = () => {
    setSelectedBiasOpt(null);
    setIsBiasSubmitted(false);
    setBiasIdx((prev) => (prev + 1) % BIAS_QUESTIONS.length);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Title */}
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
            Critical Thinking Gym
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Practice identifying logic flaws and cognitive bias patterns through interactive challenges. Earn XP to climb the ranks.
          </p>
        </section>

        {/* Stats Dashboard Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-1 pt-4 px-4 flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rank</span>
              <Award className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-lg font-bold text-foreground">Thinker II</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Next rank at {Math.ceil(xp / 500) * 500} XP</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-1 pt-4 px-4 flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total XP</span>
              <Brain className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-lg font-extrabold text-foreground">{xp} XP</div>
              <div className="w-full bg-muted h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${((xp % 500) / 500) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-1 pt-4 px-4 flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Streak</span>
              <Flame className="size-4 text-orange-500 animate-pulse" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-lg font-bold text-foreground">{streak} Days</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active streak multiplier: 1.2x</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-1 pt-4 px-4 flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Solved</span>
              <Target className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-lg font-bold text-foreground">{correctAnswers} Quiz Items</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Accuracy rate: 88.5%</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Fallacy Spotter Quiz */}
          <Card className="flex flex-col justify-between border border-border/80 shadow-sm overflow-hidden">
            <div className="bg-purple-500/5 px-4 py-3.5 border-b border-purple-500/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Fallacy Spotter</span>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground bg-card border px-2 py-0.5 rounded-full">
                Question {fallacyIdx + 1}/{FALLACY_QUESTIONS.length}
              </span>
            </div>

            <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
              {/* Question Text */}
              <div className="p-3 bg-muted/30 rounded-lg text-xs leading-relaxed font-sans border text-foreground/90">
                "{FALLACY_QUESTIONS[fallacyIdx].text}"
              </div>

              {/* Options Selector */}
              <div className="grid gap-2">
                {FALLACY_QUESTIONS[fallacyIdx].options.map((opt) => {
                  const isSelected = selectedFallacyOpt === opt;
                  let optStyle = "border-border bg-card hover:bg-muted/40 text-foreground/80";

                  if (isSelected) {
                    optStyle = "border-purple-500 bg-purple-500/5 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500";
                  }

                  if (isFallacySubmitted) {
                    const isCorrect = opt === FALLACY_QUESTIONS[fallacyIdx].answer;
                    if (isCorrect) {
                      optStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium";
                    } else if (isSelected) {
                      optStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
                    } else {
                      optStyle = "opacity-50 border-border bg-card text-muted-foreground";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleFallacySelect(opt)}
                      disabled={isFallacySubmitted}
                      className={`text-left p-3 rounded-lg border text-xs transition-all leading-none flex items-center justify-between cursor-pointer ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isFallacySubmitted && opt === FALLACY_QUESTIONS[fallacyIdx].answer && (
                        <CheckCircle className="size-3.5 text-emerald-600 shrink-0" />
                      )}
                      {isFallacySubmitted && isSelected && opt !== FALLACY_QUESTIONS[fallacyIdx].answer && (
                        <XCircle className="size-3.5 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation / Feedback */}
              <AnimatePresence>
                {isFallacySubmitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3 bg-muted/40 rounded-lg border border-border/80 text-[11px] leading-relaxed space-y-1"
                  >
                    <span className="font-bold flex items-center gap-1">
                      {selectedFallacyOpt === FALLACY_QUESTIONS[fallacyIdx].answer ? (
                        <span className="text-emerald-600 flex items-center gap-1 font-extrabold">Correct! +20 XP</span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1 font-extrabold">Incorrect</span>
                      )}
                    </span>
                    <p className="text-muted-foreground font-sans">{FALLACY_QUESTIONS[fallacyIdx].explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end">
                {!isFallacySubmitted ? (
                  <Button
                    onClick={handleFallacySubmit}
                    disabled={selectedFallacyOpt === null}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 px-4 cursor-pointer"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleFallacyNext}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 px-4 cursor-pointer gap-1"
                  >
                    Next Question <ArrowRight className="size-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bias Matcher Quiz */}
          <Card className="flex flex-col justify-between border border-border/80 shadow-sm overflow-hidden">
            <div className="bg-emerald-500/5 px-4 py-3.5 border-b border-emerald-500/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Brain className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Bias Matcher</span>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground bg-card border px-2 py-0.5 rounded-full">
                Question {biasIdx + 1}/{BIAS_QUESTIONS.length}
              </span>
            </div>

            <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
              {/* Question Text */}
              <div className="p-3 bg-muted/30 rounded-lg text-xs leading-relaxed font-sans border text-foreground/90">
                "{BIAS_QUESTIONS[biasIdx].text}"
              </div>

              {/* Options Selector */}
              <div className="grid gap-2">
                {BIAS_QUESTIONS[biasIdx].options.map((opt) => {
                  const isSelected = selectedBiasOpt === opt;
                  let optStyle = "border-border bg-card hover:bg-muted/40 text-foreground/80";

                  if (isSelected) {
                    optStyle = "border-emerald-500 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500";
                  }

                  if (isBiasSubmitted) {
                    const isCorrect = opt === BIAS_QUESTIONS[biasIdx].answer;
                    if (isCorrect) {
                      optStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium";
                    } else if (isSelected) {
                      optStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
                    } else {
                      optStyle = "opacity-50 border-border bg-card text-muted-foreground";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleBiasSelect(opt)}
                      disabled={isBiasSubmitted}
                      className={`text-left p-3 rounded-lg border text-xs transition-all leading-none flex items-center justify-between cursor-pointer ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isBiasSubmitted && opt === BIAS_QUESTIONS[biasIdx].answer && (
                        <CheckCircle className="size-3.5 text-emerald-600 shrink-0" />
                      )}
                      {isBiasSubmitted && isSelected && opt !== BIAS_QUESTIONS[biasIdx].answer && (
                        <XCircle className="size-3.5 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation / Feedback */}
              <AnimatePresence>
                {isBiasSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3 bg-muted/40 rounded-lg border border-border/80 text-[11px] leading-relaxed space-y-1"
                  >
                    <span className="font-bold flex items-center gap-1">
                      {selectedBiasOpt === BIAS_QUESTIONS[biasIdx].answer ? (
                        <span className="text-emerald-600 flex items-center gap-1 font-extrabold">Correct! +20 XP</span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1 font-extrabold">Incorrect</span>
                      )}
                    </span>
                    <p className="text-muted-foreground font-sans">{BIAS_QUESTIONS[biasIdx].explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end">
                {!isBiasSubmitted ? (
                  <Button
                    onClick={handleBiasSubmit}
                    disabled={selectedBiasOpt === null}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-4 cursor-pointer"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleBiasNext}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-4 cursor-pointer gap-1"
                  >
                    Next Question <ArrowRight className="size-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
