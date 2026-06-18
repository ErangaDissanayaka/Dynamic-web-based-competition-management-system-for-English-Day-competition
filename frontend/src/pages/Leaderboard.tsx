import { useState } from "react";
import { useData } from "@/lib/data-store";
import {
  getCategoryLabel,
  getOrderedCategories,
  type Category,
} from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function getGradeSortValue(grade: string) {
  const match = grade.match(/(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export default function Leaderboard() {
  const { events, getLeaderboard } = useData();
  const defaultEvent =
    events.find((entry) => entry.status === "results_published")?.id ||
    events[0]?.id ||
    "";
  const [selectedEvent, setSelectedEvent] = useState(defaultEvent);
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    "all",
  );

  const entries = getLeaderboard(
    selectedEvent,
    selectedCategory === "all" ? undefined : selectedCategory,
  );
  const gradeGroups = [...entries]
    .sort((a, b) => {
      const gradeDiff = getGradeSortValue(a.grade) - getGradeSortValue(b.grade);
      if (gradeDiff !== 0) return gradeDiff;
      return a.gradeRank - b.gradeRank;
    })
    .reduce<Record<string, typeof entries>>((groups, entry) => {
      if (!groups[entry.grade]) {
        groups[entry.grade] = [];
      }
      groups[entry.grade].push(entry);
      return groups;
    }, {});
  const gradeNames = Object.keys(gradeGroups).sort(
    (a, b) => getGradeSortValue(a) - getGradeSortValue(b),
  );
  const event = events.find((e) => e.id === selectedEvent);
  const categories: (Category | "all")[] = [
    "all",
    ...getOrderedCategories(event?.categories || []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="navy-gradient text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground/70 hover:text-primary-foreground"
              asChild
            >
              <Link to="/">
                <ArrowLeft size={16} className="mr-1" /> Home
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-gold" size={28} />
            <h1 className="font-display text-3xl font-bold">
              Live Leaderboard
            </h1>
          </div>

          {/* Event tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedEvent(e.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedEvent === e.id
                    ? "gold-gradient text-secondary-foreground"
                    : "glass text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {cat === "all" ? "All Categories" : getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <Trophy
              size={48}
              className="mx-auto text-muted-foreground/30 mb-4"
            />
            <p className="text-lg text-muted-foreground">
              No scores available for this event yet
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Scores will appear here once judges submit them
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {gradeNames.map((grade, gradeIndex) => (
              <section key={grade} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-bold">{grade}</h2>
                  <p className="text-sm text-muted-foreground">
                    {gradeGroups[grade].length} entries
                  </p>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {gradeGroups[grade].map((entry, i) => (
                      <motion.div
                        key={`${entry.studentName}-${entry.category}-${grade}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: gradeIndex * 0.05 + i * 0.03 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border bg-card ${
                          entry.gradeRank === 1
                            ? "border-gold/50 shadow-lg"
                            : "border-border"
                        }`}
                      >
                        {/* Rank */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg ${
                            entry.gradeRank === 1
                              ? "gold-gradient text-secondary-foreground"
                              : entry.gradeRank === 2
                                ? "bg-muted text-foreground"
                                : entry.gradeRank === 3
                                  ? "bg-muted text-foreground"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {entry.gradeRank <= 3
                            ? ["🥇", "🥈", "🥉"][entry.gradeRank - 1]
                            : entry.gradeRank}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {entry.studentName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span
                              className="w-3 h-3 rounded-full inline-block"
                              style={{ backgroundColor: entry.schoolColor }}
                            />
                            {entry.schoolName}
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                              {getCategoryLabel(entry.category)}
                            </span>
                          </div>
                        </div>

                        {/* Score breakdown */}
                        <div className="hidden sm:flex gap-4 text-xs text-muted-foreground">
                          <div className="text-center">
                            <p className="font-semibold text-foreground">
                              {entry.scores.delivery}
                            </p>
                            <p>DEL</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-foreground">
                              {entry.scores.content}
                            </p>
                            <p>CON</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-foreground">
                              {entry.scores.language}
                            </p>
                            <p>LNG</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-foreground">
                              {entry.scores.presentation}
                            </p>
                            <p>PRS</p>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="text-right">
                          <p className="text-2xl font-display font-bold text-gold-gradient">
                            {entry.avgScore}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            weighted
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
