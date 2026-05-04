import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-store";
import { getCategoryLabel, type Category, type Event } from "@/lib/types";
import { Medal, Trophy, School, ArrowRight, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { schoolPerformance } from "@/lib/mock-data";

type PublishedResult = {
  event: Event;
  rank: number;
  category: Category;
  avgScore: number;
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { schools, events, students, getLeaderboard } = useData();

  const school = schools.find((entry) => entry.id === user?.schoolId) || null;
  const publishedEvents = [...events]
    .filter((entry) => entry.status === "results_published")
    .sort((a, b) => b.year - a.year);
  const latestPublishedEvent = publishedEvents[0] || null;
  const normalizedUserName = user?.name.trim().toLowerCase() || "";
  const latestLeaderboard = latestPublishedEvent
    ? getLeaderboard(latestPublishedEvent.id)
    : [];

  const schoolComparisonData =
    latestLeaderboard.length > 0
      ? schools
          .filter((entry) => entry.approved)
          .map((entry) => {
            const schoolEntries = latestLeaderboard.filter(
              (score) => score.schoolName === entry.shortName,
            );
            const average =
              schoolEntries.length > 0
                ? Math.round(
                    schoolEntries.reduce(
                      (sum, score) => sum + score.avgScore,
                      0,
                    ) / schoolEntries.length,
                  )
                : 0;

            return {
              school: entry.shortName,
              score: average,
            };
          })
          .filter((entry) => entry.score > 0)
      : [
          { school: "SGIS", score: 90 },
          { school: "GA", score: 85 },
          { school: "SIC", score: 87 },
        ];

  const personalResults: PublishedResult[] = publishedEvents.flatMap(
    (event) => {
      const matchingStudents = students.filter(
        (student) =>
          student.eventId === event.id &&
          student.schoolId === user?.schoolId &&
          student.name.trim().toLowerCase() === normalizedUserName,
      );

      if (matchingStudents.length === 0 || !school) {
        return [];
      }

      return getLeaderboard(event.id)
        .filter(
          (entry) =>
            entry.schoolName === school.shortName &&
            matchingStudents.some(
              (student) =>
                student.name === entry.studentName &&
                student.category === entry.category,
            ),
        )
        .map((entry) => ({
          event,
          rank: entry.rank,
          category: entry.category,
          avgScore: entry.avgScore,
        }));
    },
  );

  const schoolResults = publishedEvents.flatMap((event) => {
    if (!school) {
      return [];
    }

    return getLeaderboard(event.id)
      .filter((entry) => entry.schoolName === school.shortName)
      .map((entry) => ({
        event,
        rank: entry.rank,
        category: entry.category,
        avgScore: entry.avgScore,
      }));
  });

  const featuredResults =
    personalResults.length > 0 ? personalResults : schoolResults;
  const leaderboardPreview = latestPublishedEvent
    ? getLeaderboard(latestPublishedEvent.id).slice(0, 5)
    : [];
  const podiumFinishes = featuredResults.filter(
    (result) => result.rank <= 3,
  ).length;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Student Portal
            </p>
            <h1 className="font-display text-3xl font-bold">{user?.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <School size={16} />
                <span>{school?.name || "School not linked"}</span>
              </div>
              {latestPublishedEvent && (
                <StatusBadge status={latestPublishedEvent.status} />
              )}
            </div>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/leaderboard">
              Open Full Leaderboard <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Medal className="text-accent" size={20} />
              <div>
                <p className="text-2xl font-bold">{featuredResults.length}</p>
                <p className="text-sm text-muted-foreground">
                  {personalResults.length > 0
                    ? "Published personal results"
                    : "Published school results"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Trophy className="text-warning" size={20} />
              <div>
                <p className="text-2xl font-bold">{podiumFinishes}</p>
                <p className="text-sm text-muted-foreground">Podium finishes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <School className="text-info" size={20} />
              <div>
                <p className="text-sm font-semibold">
                  {latestPublishedEvent?.name || "Awaiting published results"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Latest published event
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <BarChart3 size={20} className="text-accent" /> Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  School performance trends
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={schoolPerformance}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="year"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      domain={[70, 100]}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="SGIS"
                      stroke="#1e3a5f"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="GA"
                      stroke="#2d6a4f"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="SIC"
                      stroke="#e07b39"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  Latest published event comparison
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={schoolComparisonData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="school"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      domain={[70, 100]}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="score"
                      fill="hsl(var(--gold))"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {personalResults.length > 0
                ? "Your Published Results"
                : `Published Results for ${school?.shortName || "Your School"}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featuredResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Results will appear here after the admin publishes them.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {featuredResults.map((result) => (
                  <div
                    key={`${result.event.id}-${result.category}-${result.rank}`}
                    className="rounded-xl border border-border bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{result.event.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryLabel(result.category)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Rank
                        </p>
                        <p className="text-2xl font-display font-bold">
                          #{result.rank}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(result.event.date).toLocaleDateString()}
                      </span>
                      <span className="text-xl font-display font-bold text-gold-gradient">
                        {result.avgScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {latestPublishedEvent
                ? `${latestPublishedEvent.name} Leaderboard Preview`
                : "Leaderboard Preview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboardPreview.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No leaderboard data is available yet.
              </p>
            ) : (
              <div className="space-y-3">
                {leaderboardPreview.map((entry) => (
                  <div
                    key={`${entry.studentName}-${entry.category}`}
                    className="flex items-center justify-between rounded-xl border border-border p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        #{entry.rank} {entry.studentName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.schoolName} · {getCategoryLabel(entry.category)}
                      </p>
                    </div>
                    <p className="text-xl font-display font-bold">
                      {entry.avgScore}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
