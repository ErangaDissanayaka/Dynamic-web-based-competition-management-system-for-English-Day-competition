import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/lib/data-store";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { BarChart3 } from "lucide-react";
import { schoolPerformance } from "@/lib/mock-data";

export default function AdminAnalytics() {
  const { schools, students, scores } = useData();

  // Build bar chart from actual score data for latest event with scores
  const schoolScoreData = schools.filter(s => s.approved).map(school => {
    const schoolStudents = students.filter(st => st.schoolId === school.id);
    const schoolScores = scores.filter(sc => schoolStudents.some(st => st.id === sc.studentId));
    const avg = schoolScores.length > 0
      ? Math.round(schoolScores.reduce((sum, s) => sum + s.total, 0) / schoolScores.length)
      : 0;
    return { school: school.shortName, score: avg };
  }).filter(d => d.score > 0);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Performance trends across years</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <BarChart3 size={20} className="text-accent" /> School Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={schoolPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[70, 100]} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="SGIS" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="GA" stroke="#2d6a4f" strokeWidth={2} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="SIC" stroke="#e07b39" strokeWidth={2} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Score Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={schoolScoreData.length > 0 ? schoolScoreData : [
                  { school: "SGIS", score: 90 },
                  { school: "GA", score: 85 },
                  { school: "SIC", score: 87 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="school" stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[70, 100]} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="score" fill="hsl(var(--gold))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
