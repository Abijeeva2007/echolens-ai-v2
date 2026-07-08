"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  AlertTriangle,
  Scale,
  FileText,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
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

// Presets for the demo
const PRESETS = [
  {
    label: "Social Media Echo",
    icon: "📱",
    text: "Honestly, everyone is switching to this new decentralized social platform. If you're still on the legacy apps, you obviously don't care about privacy or freedom. The mainstream media is completely silent about it, which proves they're trying to censor us!",
    results: {
      summary: "The author asserts that switching to a new decentralized social network is the only option for those who value privacy and freedom. They argue that legacy apps are compromised and claim mainstream media silence is direct evidence of active censorship.",
      biases: [
        {
          name: "Outgroup Homogeneity Bias",
          severity: "High",
          description: "Generalizes all users of legacy platforms as indifferent to privacy rights, overlooking diverse reasons for staying (network effects, accessibility).",
          color: "bg-red-500/10 text-red-500 border-red-500/20",
        },
        {
          name: "Conspiracy/Intentionality Bias",
          severity: "Medium",
          description: "Attributes the media's lack of coverage to deliberate censorship and malice, rather than typical editorial prioritization or lack of general public interest.",
          color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        },
      ],
      fallacies: [
        {
          name: "False Dilemma (Either/Or)",
          description: "Presents a binary choice: either transition to the new decentralized platform, or have no concern for personal privacy/freedom. It ignores alternative solutions.",
          example: "'If you're still on legacy apps, you obviously don't care about privacy.'",
        },
        {
          name: "Appeal to Ignorance (Ad Ignorantiam)",
          description: "Uses a lack of coverage/evidence as proof of a positive claim (deliberate censorship).",
          example: "'The mainstream media is completely silent, which proves they're trying to censor us.'",
        },
        {
          name: "Bandwagon Fallacy (Ad Populum)",
          description: "Implies the platform is superior or correct simply because a large number of people are switching to it.",
          example: "'Everyone is switching to this new decentralized social platform.'",
        },
      ],
      score: 28,
      scoreLabel: "Highly Polarized",
      scoreDescription: "This text contains significant emotional appeals, high polarization, and lacks alternative viewpoints.",
    },
  },
  {
    label: "Corporate Tech Hype",
    icon: "🚀",
    text: "AI is completely revolutionizing every single aspect of humanity. Companies that do not integrate generative AI into their core operations immediately are guaranteed to go bankrupt within the next twelve months. We either embrace this future fully now, or get left in the dust of history.",
    results: {
      summary: "The author claims that Artificial Intelligence is an all-encompassing force that will reshape humanity. They predict immediate bankruptcy for any business that does not adopt generative AI tools within a year, framing the situation as an urgent binary survival crisis.",
      biases: [
        {
          name: "Optimism/Hype Bias",
          severity: "High",
          description: "Overestimates the immediate utility, ease of implementation, and universal success of a new technology while ignoring structural costs and regulatory barriers.",
          color: "bg-red-500/10 text-red-500 border-red-500/20",
        },
        {
          name: "Hyperbole & Alarmism",
          severity: "Medium",
          description: "Creates an artificial sense of urgency using extreme timelines (12 months) and outcomes (guaranteed bankruptcy) to drive compliance.",
          color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        },
      ],
      fallacies: [
        {
          name: "False Dilemma",
          description: "Forces a choice between full, immediate adoption and absolute failure, skipping gradual integration, testing, or industry-specific nuances.",
          example: "'We either embrace this future fully now, or get left in the dust of history.'",
        },
        {
          name: "Slippery Slope",
          description: "Assumes that lacking immediate AI integration will inevitably and quickly trigger complete corporate collapse.",
          example: "'Companies that do not integrate... are guaranteed to go bankrupt within twelve months.'",
        },
      ],
      score: 42,
      scoreLabel: "Hyperbolic / Low Nuance",
      scoreDescription: "Strong technological determinism. The statement lacks nuance regarding operational friction and industry-specific realities.",
    },
  },
  {
    label: "Political News Framing",
    icon: "⚖️",
    text: "A new economic report shows employment has risen by 2%, proving our administration's policies are a resounding success. The opposition's criticisms are just desperate attempts to hide this historic progress from the public.",
    results: {
      summary: "The statement presents a 2% rise in employment as absolute proof that the administration's policies are working. It discredits the political opposition's criticism as a dishonest, desperate attempt to cover up positive results.",
      biases: [
        {
          name: "Confirmation Bias (Cherry-Picking)",
          severity: "Medium",
          description: "Singles out a positive metric (2% employment rise) while omitting inflation, wage stagnation, debt, or other indicators to paint an exclusively positive picture.",
          color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        },
        {
          name: "In-group Favoritism / Partisan Bias",
          severity: "High",
          description: "Frames the administration as a source of historic progress and the opposition as bad-faith actors with malicious or weak motivations.",
          color: "bg-red-500/10 text-red-500 border-red-500/20",
        },
      ],
      fallacies: [
        {
          name: "Post Hoc Ergo Propter Hoc (False Cause)",
          description: "Assumes that because employment rose during their term, the administration's specific policies were the direct and sole driver of that rise.",
          example: "'employment has risen by 2%, proving our administration's policies are a resounding success.'",
        },
        {
          name: "Ad Hominem (Attack on Motive)",
          description: "Attacks the opposition's political intentions and character ('desperate attempts to hide progress') rather than addressing the substance of their economic arguments.",
          example: "'The opposition's criticisms are just desperate attempts to hide this...'",
        },
      ],
      score: 35,
      scoreLabel: "Partisan Framing",
      scoreDescription: "Single-perspective claim with partisan attribution. Avoids examining systemic global market factors or other domestic indicators.",
    },
  },
];

const LOADING_STEPS = [
  "Parsing arguments and semantic structure...",
  "Running cross-perspective validation...",
  "Scanning text for 18 cognitive biases...",
  "Checking syntax for logical fallacies...",
  "Calibrating Perspective Score...",
];

export default function DailyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Loading animation simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= LOADING_STEPS.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground bg-background">
        Loading...
      </main>
    );
  }

  if (!user) return null;

  const handlePresetSelect = (presetText: string) => {
    setText(presetText);
    setResults(null);
  };

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResults(null);

    // Find if the text matches a preset, otherwise create a mock dynamic response
    const matchedPreset = PRESETS.find(
      (p) => p.text.substring(0, 30) === text.substring(0, 30)
    );

    setTimeout(() => {
      setIsAnalyzing(false);
      if (matchedPreset) {
        setResults(matchedPreset.results);
      } else {
        // Generic dynamic analysis
        const charCount = text.length;
        const score = Math.max(15, Math.min(95, Math.round((charCount % 60) + 30)));
        setResults({
          summary: `This custom input of ${charCount} characters discusses arguments that require critical analysis. The text presents claims with selective focus and outlines a particular viewpoint.`,
          biases: [
            {
              name: "Framing Bias",
              severity: "Medium",
              description: "The information is presented in a way that guides the reader toward a specific emotional conclusion rather than an objective analysis of options.",
              color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            },
            {
              name: "Confirmation Bias",
              severity: "Low",
              description: "The claims leverage supportive scenarios while skipping counterarguments or balancing structural details.",
              color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            },
          ],
          fallacies: [
            {
              name: "Unwarranted Generalization",
              description: "Draws a general conclusion based on limited or non-representative evidence.",
              example: text.substring(0, Math.min(text.length, 60)) + "...",
            },
          ],
          score: score,
          scoreLabel: score > 70 ? "Objective & Nuanced" : score > 40 ? "Moderately Biased" : "One-Sided / Biased",
          scoreDescription: `Analysis scores this text ${score}/100. It shows a primary viewpoint with minor balance. Introducing alternative lenses would improve perspective diversity.`,
        });
      }
    }, LOADING_STEPS.length * 500 + 100);
  };

  const handleReset = () => {
    setText("");
    setResults(null);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Daily Analysis Workspace
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Paste any article, opinion, social media post, or argument to dissect its logical structure, highlight latent biases, identify fallacies, and measure perspective balance.
          </p>
        </section>

        {/* Text Input Section */}
        <Card className="shadow-sm border border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Input Text to Analyze</CardTitle>
            <CardDescription className="text-xs">
              Select a quick preset example to see it in action, or type your own.
            </CardDescription>
            <div className="flex flex-wrap gap-2 pt-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(p.text)}
                  className="h-8 gap-1.5 text-xs hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer"
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full min-h-[160px] p-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-sans leading-relaxed resize-y"
              placeholder="Paste argument, news paragraph, or social commentary here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isAnalyzing}
            />
            <div className="flex gap-3 justify-end">
              {text && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isAnalyzing}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCcw className="size-3.5 mr-1" /> Clear
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm font-medium transition-all duration-200 cursor-pointer"
              >
                <Sparkles className="size-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze Text"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State Animation */}
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center justify-center p-12 border border-border/80 rounded-xl bg-card/50 backdrop-blur-sm"
            >
              <div className="relative flex items-center justify-center mb-6">
                <div className="size-16 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
                <Sparkles className="absolute size-6 text-blue-500 animate-pulse" />
              </div>
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium text-foreground text-center max-w-xs"
              >
                {LOADING_STEPS[loadingStep]}
              </motion.p>
              <div className="w-48 bg-muted h-1 rounded-full overflow-hidden mt-4">
                <motion.div
                  className="bg-blue-600 h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Presentation */}
        <AnimatePresence>
          {results && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 pb-1 border-b">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <h2 className="text-xl font-bold tracking-tight">Critical Breakdown Completed</h2>
              </div>

              {/* Grid of analysis outputs */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* 1. Summary Card */}
                <Card className="md:col-span-2 overflow-hidden border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4.5 text-blue-500" />
                      <CardTitle className="text-md">Deconstructed Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                      {results.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* 2. Bias Detection Card */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4.5 text-orange-500" />
                      <CardTitle className="text-md">Cognitive Biases Detected</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Internal lenses warping objective representation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    {results.biases.map((bias: any, idx: number) => (
                      <div key={idx} className="space-y-1.5 p-3 rounded-lg border border-border/80 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{bias.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${bias.color}`}>
                            {bias.severity} Severity
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{bias.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 3. Logical Fallacies Card */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Scale className="size-4.5 text-purple-500" />
                      <CardTitle className="text-md">Logical Fallacies Flagged</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Flaws in reasoning that invalidate the argument.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    {results.fallacies.map((fal: any, idx: number) => (
                      <div key={idx} className="text-xs space-y-1.5 p-2.5 rounded-md border bg-muted/10">
                        <span className="font-bold text-purple-600 dark:text-purple-400">{fal.name}</span>
                        <p className="text-muted-foreground leading-snug">{fal.description}</p>
                        <p className="text-[11px] italic bg-muted/40 p-1.5 rounded text-foreground/70 leading-normal">
                          {fal.example}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 4. Perspective Score Card */}
                <Card className="md:col-span-2 overflow-hidden flex flex-col sm:flex-row items-center gap-6 p-6">
                  {/* Gauge indicator */}
                  <div className="relative flex items-center justify-center shrink-0">
                    {/* SVG Gauge */}
                    <svg className="size-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        className="stroke-muted fill-none"
                        strokeWidth="10"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        className="stroke-blue-600 dark:stroke-blue-400 fill-none"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 54}
                        strokeDashoffset={2 * Math.PI * 54 * (1 - results.score / 100)}
                        strokeLinecap="round"
                        transform="rotate(-90 64 64)"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-primary">{results.score}</span>
                      <span className="text-[10px] text-muted-foreground block font-bold">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{results.scoreLabel}</span>
                      <Badge variant={results.score > 60 ? "default" : "secondary"}>
                        {results.score > 60 ? "Balanced" : "Low Perspective Integration"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {results.scoreDescription}
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <TrendingUp className="size-3.5 animate-bounce" />
                      <span>Advice: Try simulating Boomer or Technologist perspectives on this text in Simulation Mode!</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
