import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Award,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/CountdownTimer";
import { events, students } from "@/lib/mock-data";
import { useData } from "@/lib/data-store";
import {
  COMPETITION_LEVELS,
  DEFAULT_EVENT_CATEGORIES,
  getCategoryDescription,
  getCategoryGradeBand,
  getCategoryIcon,
  getCategoryLabel,
  getOrderedCategories,
  type Event,
} from "@/lib/types";

function selectActiveEvent(allEvents: Event[]) {
  if (!allEvents.length) return null;

  const now = Date.now();
  const parseTime = (value: string) => new Date(value).getTime();

  const futureCandidates = allEvents
    .filter(
      (event) =>
        event.status !== "results_published" && parseTime(event.date) >= now,
    )
    .sort((a, b) => parseTime(a.date) - parseTime(b.date));

  if (futureCandidates.length > 0) {
    return futureCandidates[0];
  }

  return [...allEvents].sort(
    (a, b) => parseTime(b.date) - parseTime(a.date),
  )[0];
}

function getHallOfFameEntries(
  allEvents: Event[],
  getLeaderboard: (eventId: string) => Array<{
    studentId: string;
    rank: number;
    studentName: string;
    schoolName: string;
    schoolColor: string;
    category: string;
    avgScore: number;
    scores: {
      delivery: number;
      content: number;
      language: number;
      presentation: number;
    };
  }>,
) {
  const sorted = allEvents
    .filter((event) => event.status === "results_published")
    .flatMap((event) =>
      getLeaderboard(event.id).map((entry) => ({
        ...entry,
        year: event.year,
      })),
    )
    .sort((a, b) => b.avgScore - a.avgScore);

  const unique: typeof sorted = [];
  const seen = new Set<string>();
  for (const entry of sorted) {
    if (!entry.studentId || seen.has(entry.studentId)) continue;
    unique.push(entry);
    seen.add(entry.studentId);
    if (unique.length === 3) break;
  }

  return unique;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const {
    events: liveEvents,
    students: liveStudents,
    getLeaderboard,
  } = useData();
  const sourceEvents = liveEvents.length > 0 ? liveEvents : events;
  const sourceStudents = liveStudents.length > 0 ? liveStudents : students;
  const hallOfFameEntries = getHallOfFameEntries(sourceEvents, getLeaderboard);

  const currentEvent = selectActiveEvent(sourceEvents);
  const currentCategories = getOrderedCategories(
    currentEvent?.categories?.length
      ? currentEvent.categories
      : DEFAULT_EVENT_CATEGORIES,
  );
  const eventDateLabel = currentEvent
    ? new Date(currentEvent.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "To be announced";
  const eventVenueLabel = currentEvent?.venue || "Venue to be announced";
  const registeredSchoolCount = currentEvent
    ? new Set(
        sourceStudents
          .filter((student) => student.eventId === currentEvent.id)
          .map((student) => student.schoolId),
      ).size
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden navy-gradient text-primary-foreground">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, hsl(45 90% 55% / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(45 90% 55% / 0.2) 0%, transparent 40%)",
          }}
        />
        <div className="relative container mx-auto px-4 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-6">
              <Star size={14} className="text-gold" />
              <span>Ministry-Aligned Inter-School Format</span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              English <span className="text-gold-gradient">Day</span> 2026
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
              Built around Sri Lanka's English Day tradition, from school-level
              selections to national finals across oral, literary, written, and
              dramatic events.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="gold-gradient text-secondary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </Button>
              <Button
                size="lg"
                className="gold-gradient text-secondary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
              <Button
                size="lg"
                className="gold-gradient text-secondary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity"
                onClick={() => navigate("/leaderboard")}
              >
                View Leaderboard
              </Button>
            </div>

            <CountdownTimer
              targetDate={currentEvent?.date || new Date().toISOString()}
              label="Competition Starts In"
            />
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-6 -mt-24 relative z-10"
        >
          {[
            {
              icon: Calendar,
              label: "Date",
              value: eventDateLabel,
            },
            { icon: MapPin, label: "Venue", value: eventVenueLabel },
            {
              icon: Users,
              label: "Schools",
              value: `${registeredSchoolCount} Registered Schools`,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 shadow-lg border border-border flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <item.icon size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="font-semibold text-card-foreground">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-2">
          Competition Categories
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          Core events aligned with English Day formats for Grades 1-13
        </p>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentCategories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-5xl mb-4">{getCategoryIcon(category)}</div>
              <h3 className="font-display text-xl font-bold mb-1">
                {getCategoryLabel(category)}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                {getCategoryGradeBand(category)}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {getCategoryDescription(category)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-4 pb-16">
        <h2 className="font-display text-3xl font-bold text-center mb-2">
          Competition Pathway
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          Progression mirrors the zonal, district, provincial, and national
          structure.
        </p>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COMPETITION_LEVELS.map((level, index) => (
            <motion.div
              key={level.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Stage {index + 1}
              </p>
              <h3 className="mt-3 font-display text-xl font-bold">
                {level.label}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {level.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="navy-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Award className="text-gold" size={28} />
            <h2 className="font-display text-3xl font-bold">Hall of Fame</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {hallOfFameEntries.map((winner, index) => (
              <motion.div
                key={`${winner.studentName}-${winner.studentId}-${winner.category}-${winner.year}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 text-center"
              >
                <div className="text-3xl mb-2">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </div>
                <p className="font-display text-lg font-bold">
                  {winner.studentName}
                </p>
                <p className="text-sm text-primary-foreground/60">
                  {winner.schoolName} · {getCategoryLabel(winner.category)}
                </p>
                <p className="text-gold font-bold mt-2">
                  {winner.avgScore} pts
                </p>
                <p className="text-xs text-primary-foreground/40 mt-1">
                  {winner.year}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Live Results</h2>
        <p className="text-muted-foreground mb-8">
          Track judging and leaderboard movement as each English Day category
          concludes.
        </p>
        <Button
          size="lg"
          className="gold-gradient text-secondary-foreground font-semibold"
          asChild
        >
          <Link to="/leaderboard">
            View Leaderboard <ChevronRight size={18} className="ml-1" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            English Day Competition Management System ©{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
