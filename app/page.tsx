import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

// Main dashboard page for Nutri-Health App
export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-2 py-4 sm:px-4">
      <header className="w-full max-w-md mx-auto py-2 flex flex-col items-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Nutri-Health</h1>
        <p className="text-sm text-muted-foreground mb-4 text-center">Track your meals, progress, and health metrics. Gamified. Mobile-first. PWA-ready.</p>
      </header>
      <main className="flex flex-col gap-6 w-full max-w-md">
        {/* Meal Logging Card */}
        <Card>
          <CardHeader>
            <CardTitle>Log Today’s Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/meals/log">Log a Meal</Link>
              </Button>
              <p className="text-xs text-muted-foreground">You can log up to 6 meals per day.</p>
            </div>
          </CardContent>
        </Card>
        {/* Weekly Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={40} className="mb-2" />
            <p className="text-xs text-muted-foreground">4/6 days logged this week. Keep going!</p>
            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <Link href="/progress">View Details</Link>
            </Button>
          </CardContent>
        </Card>
        {/* Profile & Bioimpedance */}
        <Card>
          <CardHeader>
            <CardTitle>Profile & Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full mb-2">
              <Link href="/profile">View Profile</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/metrics">Bioimpedance Data</Link>
            </Button>
          </CardContent>
        </Card>
        {/* Admin Panel Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="destructive" className="w-full" disabled>
              <span>Admin Access (Coming Soon)</span>
            </Button>
          </CardContent>
        </Card>
      </main>
      <footer className="mt-10 text-xs text-muted-foreground text-center">
        Nutri-Health &copy; {new Date().getFullYear()} &mdash; Powered by Next.js, V0, ShadCN UI
      </footer>
    </div>
  );
}
