"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Users,
  Compass,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  ShieldAlert,
  Send,
  HelpCircle,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Available lenses
const LENSES = [
  {
    id: "tech_optimist",
    name: "Tech Optimist",
    emoji: "🤖",
    description: "Focuses on efficiency, automation, progress, and market-driven solutions.",
    color: "border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5",
    activeColor: "ring-2 ring-blue-500 border-blue-500 bg-blue-500/10",
  },
  {
    id: "environmentalist",
    name: "Environmentalist",
    emoji: "🌱",
    description: "Prioritizes conservation, climate impact, long-term ecology, and caution.",
    color: "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
    activeColor: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10",
  },
  {
    id: "genz_activist",
    name: "Gen Z Activist",
    emoji: "⚡",
    description: "Emphasizes social justice, equity, digital disruption, and urgent reform.",
    color: "border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/5",
    activeColor: "ring-2 ring-amber-500 border-amber-500 bg-amber-500/10",
  },
  {
    id: "boomer_trustee",
    name: "Boomer Trustee",
    emoji: "💼",
    description: "Values historical precedent, institutional stability, and gradual change.",
    color: "border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5",
    activeColor: "ring-2 ring-purple-500 border-purple-500 bg-purple-500/10",
  },
];

// Presets for topics and conversations
const TOPIC_PRESETS = [
  "AI replacing creative human jobs",
  "Implementing a heavy carbon tax on domestic corporations",
  "Mandating remote work options as a legal employee right",
];

const PRESET_CONVERSATIONS: Record<string, { dialogue: any[]; reflection: any }> = {
  "AI replacing creative human jobs": {
    dialogue: [
      {
        lensId: "tech_optimist",
        text: "AI creative tools don't destroy creativity; they democratize it. By automating repetitive tasks, millions of people can now generate high-quality art, music, and text instantly, increasing overall human output.",
      },
      {
        lensId: "genz_activist",
        text: "Sure, 'democratization' sounds great, but who actually profits? Big Tech is training these models on artists' stolen work without consent, while corporate executives use it to lay off writers and designers. It's systemic exploitation.",
      },
      {
        lensId: "boomer_trustee",
        text: "We must also consider the loss of professional standards and craftsmanship. A career in the arts used to require years of mentorship and discipline. If everything is generated in seconds, we risk diluting our cultural heritage and institutional knowledge.",
      },
      {
        lensId: "tech_optimist",
        text: "Every major shift—from the printing press to digital cameras—faced the same criticisms. Workers adapt, new professions emerge, and the economy grows. Resisting this transition only slows down inevitable progress.",
      },
    ],
    reflection: {
      tension: "Clash between technological efficiency/automation speed (Tech Optimist) and labor rights/artistic compensation (Gen Z Activist), combined with a concern for cultural heritage and professional standards (Boomer Trustee).",
      commonGround: "All parties agree that AI is fundamentally altering the creative landscape and that human workers will face displacement challenges during the transition.",
      synthesis: "A balanced framework requires developing fair compensation models for creators (e.g. data licensing options) while integrating AI as a supportive tool rather than a full replacement for human-led craftsmanship.",
    },
  },
  "Implementing a heavy carbon tax on domestic corporations": {
    dialogue: [
      {
        lensId: "environmentalist",
        text: "A heavy carbon tax is the most direct way to internalize the true cost of pollution. Corporations must face financial incentives to transition to clean energy, or they will continue destroying our planet for short-term profits.",
      },
      {
        lensId: "boomer_trustee",
        text: "But an aggressive tax will shock the economy. Corporations will pass these massive costs directly to consumers, raising energy prices, or they will relocate operations overseas, destroying domestic manufacturing jobs and stability.",
      },
      {
        lensId: "tech_optimist",
        text: "Exactly. Instead of punitive taxation that slows growth, we should incentivize clean-tech innovation. Tax credits for green energy R&D and funding fusion power will solve emissions through technology, not bureaucracy.",
      },
      {
        lensId: "environmentalist",
        text: "Incentives alone are too slow—we are out of time. Innovation is great, but without clear, immediate penalties for emissions, fossil fuels will remain the default choice for major corporations due to inertia.",
      },
    ],
    reflection: {
      tension: "Pitting immediate ecological survival measures (Environmentalist) against short-term consumer economic stability (Boomer Trustee) and technology-driven incentive solutions (Tech Optimist).",
      commonGround: "All perspectives recognize that transitioning away from greenhouse gas emissions is necessary; they differ strictly on the timeline and policy instruments.",
      synthesis: "An optimal policy combines a phased carbon tax (giving businesses time to adapt) with direct earmarks returning tax revenues to fund clean technology research and consumer energy subsidies.",
    },
  },
};

const DEBATE_API_URL = "https://echolens-api-v2.onrender.com/simulation/debate";

export default function SimulationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedLenses, setSelectedLenses] = useState<string[]>(["tech_optimist", "genz_activist"]);
  const [topic, setTopic] = useState("");
  const [simulationState, setSimulationState] = useState<"idle" | "loading" | "running" | "completed">("idle");
  const [messages, setMessages] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showReflection, setShowReflection] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);
  const [reflectionData, setReflectionData] = useState<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, simulationState]);

  // Clean up any running interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground bg-background">
        Loading...
      </main>
    );
  }

  if (!user) return null;

  const toggleLens = (lensId: string) => {
    if (selectedLenses.includes(lensId)) {
      if (selectedLenses.length > 2) {
        setSelectedLenses(selectedLenses.filter((id) => id !== lensId));
      }
    } else {
      if (selectedLenses.length < 3) {
        setSelectedLenses([...selectedLenses, lensId]);
      } else {
        // Swap the second one
        setSelectedLenses([selectedLenses[0], selectedLenses[2], lensId]);
      }
    }
    // Reset conversation if settings change
    resetSimulation();
  };

  const handlePresetClick = (preset: string) => {
    setTopic(preset);
    resetSimulation();
  };

  const resetSimulation = () => {
    setSimulationState("idle");
    setMessages([]);
    setShowReflection(false);
    setReflectionData(null);
    setErrorMessage(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleSimulate = async () => {
    if (!topic.trim()) return;

    // Clear any prior run
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setMessages([]);
    setErrorMessage(null);
    setShowReflection(false);
    setReflectionData(null);
    setSimulationState("loading");

    try {
      const res = await fetch(DEBATE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          lenses: selectedLenses, // pass selected lenses to the backend
        }),
      });

      if (!res.ok) {
        throw new Error(`Debate API responded with status ${res.status}`);
      }

      const data = await res.json();

      // Defensive check: bail out cleanly if shape is unexpected
      if (!data || !Array.isArray(data.participants) || data.participants.length === 0) {
        throw new Error("Debate API returned an unexpected response shape.");
      }

      setSimulationState("running");

      let index = 0;

      intervalRef.current = setInterval(() => {
        if (index >= data.participants.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setSimulationState("completed");
          return;
        }

        const participant = data.participants[index];

        if (!participant) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setSimulationState("completed");
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            lensId: participant.lensId,
            name: participant.name ?? "Unknown Perspective",
            emoji: participant.emoji ?? "💬",
            description: participant.description ?? "",
            text: participant.message ?? "",
          },
        ]);

        index++;
      }, 1200);

      // Store reflection in React state instead of a global
      setReflectionData(data.reflection ?? null);
    } catch (err: any) {
      console.error("Simulation failed:", err);
      setSimulationState("idle");
      setErrorMessage(
        err?.message?.includes("Failed to fetch")
          ? "Couldn't reach the simulation server. Check your connection and try again."
          : "Something went wrong running the simulation. Please try again."
      );
    }
  };

  const handleReflect = () => {
    setIsReflecting(true);

    setTimeout(() => {
      setIsReflecting(false);
      setShowReflection(true);
    }, 1200);
  };

  // Get reflection content
  const getReflectionData = () => {
    // First use the API-generated reflection (from React state, not window)
    if (reflectionData) {
      return {
        tension: reflectionData.tension ?? "",
        commonGround: reflectionData.common_ground ?? "",
        synthesis: reflectionData.synthesis ?? "",
      };
    }

    // Otherwise use preset reflections
    const presetKey = Object.keys(PRESET_CONVERSATIONS).find(
      (key) => key.toLowerCase() === topic.trim().toLowerCase()
    );

    if (presetKey) {
      return PRESET_CONVERSATIONS[presetKey].reflection;
    }

    // Final fallback
    return {
      tension: "",
      commonGround: "",
      synthesis: "",
    };
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400">
            Perspective Simulator
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Select different ideological, generational, or professional "lenses" to simulate a dialogue on any topic, revealing how varied assumptions frame the same information.
          </p>
        </section>

        {/* Configuration Panel */}
        <div className="grid gap-5 md:grid-cols-3">
          {/* Lenses Selector */}
          <Card className="md:col-span-2 shadow-sm border border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2">
                <Users className="size-4 text-purple-500" />
                Select Lenses (Pick 2 or 3)
              </CardTitle>
              <CardDescription className="text-xs">
                These viewpoints will debate your chosen topic.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {LENSES.map((lens) => {
                  const isActive = selectedLenses.includes(lens.id);
                  return (
                    <button
                      key={lens.id}
                      onClick={() => toggleLens(lens.id)}
                      className={`text-left p-3 rounded-lg border text-sm transition-all flex flex-col justify-between h-24 cursor-pointer hover:shadow-sm ${
                        isActive ? lens.activeColor : "bg-card hover:bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{lens.emoji}</span>
                          <span>{lens.name}</span>
                        </span>
                        {isActive && (
                          <span className="text-[10px] bg-purple-600 text-white dark:bg-purple-500 px-1.5 py-0.5 rounded-full font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground leading-snug line-clamp-2">
                        {lens.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Topic Panel */}
          <Card className="shadow-sm border border-border/80 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2">
                <Compass className="size-4 text-purple-500" />
                Configure Topic
              </CardTitle>
              <CardDescription className="text-xs">
                Write a policy, event, or trend to simulate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="topic-input" className="text-xs font-semibold">Debate Topic</Label>
                  <Input
                    id="topic-input"
                    placeholder="Enter topic..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={simulationState === "running" || simulationState === "loading"}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
                    Presets
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {TOPIC_PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePresetClick(p)}
                        disabled={simulationState === "running" || simulationState === "loading"}
                        className="text-[11px] text-left text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-muted/40 p-1.5 rounded transition-all truncate border border-border/20 cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-1.5 text-[11px] text-red-500 bg-red-500/5 border border-red-500/20 rounded-md p-2">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                onClick={handleSimulate}
                disabled={!topic.trim() || selectedLenses.length < 2 || simulationState === "running" || simulationState === "loading"}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium gap-1.5 h-9 text-xs shadow-sm cursor-pointer transition-all"
              >
                <RefreshCw className={`size-3.5 ${simulationState === "running" || simulationState === "loading" ? "animate-spin" : ""}`} />
                {simulationState === "loading" ? "Initializing..." : "Run Simulation"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Simulation Output Area */}
        {simulationState !== "idle" && (
          <Card className="shadow-sm border border-border/80 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/40 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <MessageSquare className="size-4 text-purple-500" />
                    Simulated Debate Chamber
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Topic: <span className="font-semibold text-foreground">{topic}</span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="h-5 text-[10px]">
                  {simulationState === "loading" && "Loading Engines"}
                  {simulationState === "running" && "Generating Dialogue"}
                  {simulationState === "completed" && "Simulation Ready"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 bg-muted/5 min-h-[300px] flex flex-col justify-between">
              {/* Message History */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 pb-4 flex-1">
                {simulationState === "loading" && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw className="size-8 text-purple-500 animate-spin" />
                    <span className="text-xs text-muted-foreground font-medium animate-pulse">
                      Synthesizing dataset frameworks...
                    </span>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="text-2xl">
                      {msg.emoji}
                    </div>

                    <div className="flex-1 rounded-lg border p-4 bg-card">
                      <h3 className="font-semibold">
                        {msg.name}
                      </h3>

                      <p className="text-xs text-muted-foreground mb-2">
                        {msg.description}
                      </p>

                      <p>{msg.text}</p>
                    </div>
                  </motion.div>
                ))}

                {simulationState === "running" && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground p-3 pl-12 font-medium">
                    <span className="size-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="ml-1 text-[10px]">Thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Action and reflection buttons */}
              {simulationState === "completed" && (
                <div className="pt-4 border-t border-border/60 flex justify-end gap-3">
                  <Button
                    onClick={handleSimulate}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 cursor-pointer"
                  >
                    <RefreshCw className="size-3 mr-1" /> Re-run
                  </Button>
                  <Button
                    onClick={handleReflect}
                    disabled={isReflecting}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs h-8 shadow-sm cursor-pointer gap-1.5"
                  >
                    <Lightbulb className={`size-3.5 ${isReflecting ? "animate-pulse" : ""}`} />
                    {isReflecting ? "Analyzing Dialogue..." : "Reflect & Synthesize"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reflection output card */}
        <AnimatePresence>
          {showReflection && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 pb-1 border-b">
                <Lightbulb className="size-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-bold tracking-tight">Perspective Synthesis Reflection</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Points of tension */}
                <Card className="border-l-4 border-l-red-500 bg-red-500/[0.02]">
                  <CardHeader className="pb-1.5 pt-4">
                    <CardTitle className="text-xs text-red-500 font-bold uppercase tracking-wider">
                      Points of Tension
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                      {getReflectionData().tension}
                    </p>
                  </CardContent>
                </Card>

                {/* Common ground */}
                <Card className="border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]">
                  <CardHeader className="pb-1.5 pt-4">
                    <CardTitle className="text-xs text-emerald-500 font-bold uppercase tracking-wider">
                      Common Ground
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                      {getReflectionData().commonGround}
                    </p>
                  </CardContent>
                </Card>

                {/* Synthesis */}
                <Card className="border-l-4 border-l-purple-500 bg-purple-500/[0.02]">
                  <CardHeader className="pb-1.5 pt-4">
                    <CardTitle className="text-xs text-purple-500 font-bold uppercase tracking-wider">
                      Optimal Synthesis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                      {getReflectionData().synthesis}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}