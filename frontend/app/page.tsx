import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-4 py-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          EchoLens
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Analyze information critically, experience other perspectives, and
          build stronger thinking skills through interactive learning.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Daily Mode</CardTitle>
            <CardDescription>
              Analyze articles, posts, and text for persuasion, bias, and
              missing viewpoints.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Simulation Mode</CardTitle>
            <CardDescription>
              Temporarily experience how another country, profession, or
              generation might see the same information.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Learning Mode</CardTitle>
            <CardDescription>
              Practice critical thinking with interactive games that sharpen
              bias recognition and perspective taking.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            Sign in to your dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
