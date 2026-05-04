import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/lib/data-store";
import { useAuth } from "@/lib/auth-context";
import {
  calculateWeightedTotal,
  getCategoryGradeBand,
  getCategoryLabel,
  getCategoryScoreCriteria,
  type Category,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type ScoreDraft = {
  delivery: number;
  content: number;
  language: number;
  presentation: number;
};

export default function JudgeScoring() {
  const { user } = useAuth();
  const { students, schools, events, submitScore } = useData();
  const activeEvent =
    events.find((entry) => entry.status === "judging_live") ||
    events.find((entry) => entry.status === "registration_closed") ||
    events.find((entry) => entry.status === "registration_open") ||
    events[events.length - 1];
  const currentStudents = students.filter((student) => {
    if (student.eventId !== activeEvent?.id) {
      return false;
    }

    return !user?.judgeCategory || user.judgeCategory === "all"
      ? true
      : student.category === user.judgeCategory;
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [localScores, setLocalScores] = useState<Record<string, ScoreDraft>>(
    {},
  );
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  if (currentStudents.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">
            {user?.judgeCategory && user.judgeCategory !== "all"
              ? `No students found for ${getCategoryLabel(user.judgeCategory)} in the current event yet.`
              : "No students registered for the current event yet."}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const student = currentStudents[currentIdx];
  const school = schools.find((s) => s.id === student.schoolId)!;
  const scoringCriteria = getCategoryScoreCriteria(student.category);
  const studentScores = localScores[student.id] || {
    delivery: 0,
    content: 0,
    language: 0,
    presentation: 0,
  };
  const total = calculateWeightedTotal(studentScores, student.category);

  const updateScore = (key: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setLocalScores((prev) => ({
      ...prev,
      [student.id]: { ...studentScores, [key]: clamped },
    }));
  };

  const handleSubmit = async () => {
    const result = await submitScore(
      student.id,
      student.eventId,
      student.category,
      studentScores,
    );
    if (!result.ok) {
      toast.error(
        result.message || "Could not submit scores. Please try again.",
      );
      return;
    }

    setSubmitted((prev) => new Set(prev).add(student.id));
    toast.success(`Scores submitted for ${student.name}`);
    if (currentIdx < currentStudents.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">
            Judge Scoring
          </h1>
          <p className="text-muted-foreground text-sm">
            Student {currentIdx + 1} of {currentStudents.length}
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {currentStudents.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentIdx(i)}
              className={`h-2 flex-1 rounded-full transition-all ${
                submitted.has(s.id)
                  ? "bg-success"
                  : i === currentIdx
                    ? "gold-gradient"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Student Card */}
        <motion.div
          key={student.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: school.color + "20" }}
                >
                  {school.logo}
                </div>
                <div>
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {school.shortName} ·{" "}
                    {getCategoryLabel(student.category as Category)} ·{" "}
                    {student.grade}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Eligible range: {getCategoryGradeBand(student.category)}
                  </p>
                </div>
                {submitted.has(student.id) && (
                  <CheckCircle2 className="ml-auto text-success" size={24} />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {scoringCriteria.map((crit) => (
                <div key={crit.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      {crit.label}{" "}
                      <span className="text-muted-foreground">
                        ({crit.weight * 100}%)
                      </span>
                    </label>
                    <span className="text-sm font-bold tabular-nums">
                      {studentScores[crit.key] || 0}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={studentScores[crit.key] || 0}
                      onChange={(e) =>
                        updateScore(crit.key, parseInt(e.target.value))
                      }
                      className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-accent"
                      style={{ accentColor: "hsl(45 90% 55%)" }}
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={studentScores[crit.key] || 0}
                      onChange={(e) =>
                        updateScore(crit.key, parseInt(e.target.value) || 0)
                      }
                      className="w-16 text-center p-2 rounded-lg border border-input bg-background text-sm font-mono"
                    />
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">
                    Weighted Total
                  </span>
                  <span className="text-3xl font-display font-bold text-gold-gradient">
                    {total}
                  </span>
                </div>
              </div>

              <Button
                className="w-full gold-gradient text-secondary-foreground font-semibold text-base py-6"
                onClick={handleSubmit}
                disabled={submitted.has(student.id)}
              >
                {submitted.has(student.id) ? "Submitted ✓" : "Submit Scores"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
          >
            <ChevronLeft size={16} className="mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentIdx(
                Math.min(currentStudents.length - 1, currentIdx + 1),
              )
            }
            disabled={currentIdx === currentStudents.length - 1}
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
