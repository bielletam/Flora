import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tighter mb-4">
          Welcome to MindBloom
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Track your habits, journal your thoughts, and watch yourself bloom.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
