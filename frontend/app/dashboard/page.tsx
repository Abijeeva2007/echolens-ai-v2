"use client";

import Link from "next/link";
import { Brain, FileText, MessageSquare, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const modeCards = [
  {
    title: "Daily Mode",
    description:
      "Analyze articles, social posts, and text for persuasion techniques, logical fallacies, and missing viewpoints.",
    href: "/daily",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "hover:border-blue-500/30",
  },
  {
    title: "Simulation Mode",
    description:
      "Experience how another country, profession, generation, or ideology might frame the same information.",
    href: "/simulation",
    icon: MessageSquare,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "hover:border-purple-500/30",
  },
  {
    title: "Learning Mode",
    description:
      "Play interactive games that strengthen bias recognition, misinformation detection, and perspective taking.",
    href: "/learning",
    icon: Brain,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "hover:border-emerald-500/30",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
          Welcome back, {user.username}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Your growth profile tracks progress across Daily, Simulation, and
          Learning modes.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total XP</CardTitle>
            <CardDescription className="hidden">Experience earned across all modes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-primary">{user.xp} XP</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current streak</CardTitle>
            <CardDescription className="hidden">Consecutive days of activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-primary">{user.streak} days 🔥</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Modes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modeCards.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link href={mode.href} key={mode.title} className="group">
                <Card className={`h-full border border-border/60 ${mode.borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card cursor-pointer flex flex-col justify-between`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${mode.bgColor}`}>
                        <Icon className={`size-5 ${mode.color}`} />
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{mode.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">{mode.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex items-center justify-end text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="flex items-center gap-1">
                      Start Mode <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Growth Profile</CardTitle>
          <CardDescription>
            Detailed skill tracking and activity history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">Coming in Phase 5</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
