import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Habits</h2>
          <p className="text-muted-foreground">Track your daily habits</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Journal Entries</h2>
          <p className="text-muted-foreground">View your journal posts</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Analytics</h2>
          <p className="text-muted-foreground">See your progress</p>
        </Card>
      </div>
    </div>
  );
}
