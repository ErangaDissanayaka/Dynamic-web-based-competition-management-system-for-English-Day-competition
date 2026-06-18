import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import type {
  School,
  Student,
  Event,
  Score,
  Category,
  EventNotificationSummary,
  ScoreInput,
} from "./types";
import { calculateWeightedTotal } from "./types";
import {
  schools as initialSchools,
  students as initialStudents,
  events as initialEvents,
  scores as initialScores,
} from "./mock-data";
import {
  approveSchoolRequest,
  createEventRequest,
  createStudentRequest,
  deleteStudentRequest,
  fetchEventsRequest,
  fetchSchoolsRequest,
  fetchScoresRequest,
  fetchStudentsRequest,
  rejectSchoolRequest,
  submitScoreRequest,
  updateEventStatusRequest,
  updateEventRequest,
  isApiError,
} from "./api";
import { useAuth } from "./auth-context";

type ActionResult = {
  ok: boolean;
  message?: string;
};

interface DataStore {
  schools: School[];
  students: Student[];
  events: Event[];
  scores: Score[];
  isSyncing: boolean;
  addStudent: (student: Omit<Student, "id">) => Promise<ActionResult>;
  removeStudent: (id: string) => Promise<boolean>;
  approveSchool: (id: string) => Promise<boolean>;
  rejectSchool: (id: string) => Promise<boolean>;
  addEvent: (event: Omit<Event, "id">) => Promise<{
    ok: boolean;
    notifications?: EventNotificationSummary;
  }>;
  updateEvent: (
    id: string,
    event: Omit<Event, "id" | "status">,
  ) => Promise<boolean>;
  updateEventStatus: (id: string, status: Event["status"]) => Promise<boolean>;
  submitScore: (
    studentId: string,
    eventId: string,
    category: Category,
    scores: ScoreInput,
  ) => Promise<ActionResult>;
  getLeaderboard: (
    eventId: string,
    category?: Category,
  ) => Array<{
    studentId: string;
    rank: number;
    studentName: string;
    schoolName: string;
    schoolColor: string;
    category: Category;
    avgScore: number;
    scores: {
      delivery: number;
      content: number;
      language: number;
      presentation: number;
    };
  }>;
}

const DataContext = createContext<DataStore | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([...initialSchools]);
  const [students, setStudents] = useState<Student[]>([...initialStudents]);
  const [events, setEvents] = useState<Event[]>([...initialEvents]);
  const [scores, setScores] = useState<Score[]>([...initialScores]);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshAll = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [nextSchools, nextEvents, nextStudents, nextScores] =
        await Promise.all([
          fetchSchoolsRequest(),
          fetchEventsRequest(),
          fetchStudentsRequest(),
          fetchScoresRequest(),
        ]);

      setSchools(nextSchools);
      setEvents(nextEvents);
      setStudents(nextStudents);
      setScores(nextScores);
    } catch (error) {
      // Keep mock-backed state as fallback when API is unavailable.
      console.error("Failed to sync data from backend", error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const addStudent = useCallback(async (student: Omit<Student, "id">) => {
    const tempId = `tmp-${Date.now()}`;
    const optimisticStudent: Student = { ...student, id: tempId };
    setStudents((prev) => [...prev, optimisticStudent]);

    try {
      const created = await createStudentRequest(student);
      setStudents((prev) =>
        prev.map((entry) => (entry.id === tempId ? created : entry)),
      );
      return { ok: true };
    } catch (error) {
      setStudents((prev) => prev.filter((entry) => entry.id !== tempId));
      console.error("Failed to add student", error);
      return {
        ok: false,
        message: isApiError(error)
          ? error.message
          : "Could not register student. Please try again.",
      };
    }
  }, []);

  const removeStudent = useCallback(
    async (id: string) => {
      const previous = students;
      setStudents((prev) => prev.filter((entry) => entry.id !== id));

      try {
        await deleteStudentRequest(id);
        return true;
      } catch (error) {
        setStudents(previous);
        console.error("Failed to remove student", error);
        return false;
      }
    },
    [students],
  );

  const approveSchool = useCallback(
    async (id: string) => {
      setSchools((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, approved: true } : entry,
        ),
      );

      try {
        const updated = await approveSchoolRequest(id);
        setSchools((prev) =>
          prev.map((entry) => (entry.id === id ? updated : entry)),
        );
        return true;
      } catch (error) {
        void refreshAll();
        console.error("Failed to approve school", error);
        return false;
      }
    },
    [refreshAll],
  );

  const rejectSchool = useCallback(
    async (id: string) => {
      const previous = schools;
      setSchools((prev) => prev.filter((entry) => entry.id !== id));

      try {
        await rejectSchoolRequest(id);
        return true;
      } catch (error) {
        setSchools(previous);
        console.error("Failed to reject school", error);
        return false;
      }
    },
    [schools],
  );

  const addEvent = useCallback(async (event: Omit<Event, "id">) => {
    const tempId = `tmp-${Date.now()}`;
    const optimisticEvent: Event = { ...event, id: tempId };
    setEvents((prev) => [...prev, optimisticEvent]);

    try {
      const created = await createEventRequest(event);
      setEvents((prev) =>
        prev.map((entry) => (entry.id === tempId ? created.event : entry)),
      );
      return { ok: true, notifications: created.notifications };
    } catch (error) {
      setEvents((prev) => prev.filter((entry) => entry.id !== tempId));
      console.error("Failed to create event", error);
      return { ok: false };
    }
  }, []);

  const updateEvent = useCallback(
    async (id: string, event: Omit<Event, "id" | "status">) => {
      const previous = events;
      setEvents((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, ...event } : entry)),
      );

      try {
        const updated = await updateEventRequest(id, event);
        setEvents((prev) =>
          prev.map((entry) => (entry.id === id ? updated : entry)),
        );
        return true;
      } catch (error) {
        setEvents(previous);
        console.error("Failed to update event", error);
        return false;
      }
    },
    [events],
  );

  const updateEventStatus = useCallback(
    async (id: string, status: Event["status"]) => {
      const previous = events;
      setEvents((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)),
      );

      try {
        const updated = await updateEventStatusRequest(id, status);
        setEvents((prev) =>
          prev.map((entry) => (entry.id === id ? updated : entry)),
        );
        return true;
      } catch (error) {
        setEvents(previous);
        console.error("Failed to update event status", error);
        return false;
      }
    },
    [events],
  );

  const submitScore = useCallback(
    async (
      studentId: string,
      eventId: string,
      category: Category,
      s: ScoreInput,
    ) => {
      const previous = scores;
      const judgeId = user?.id || "j1";

      setScores((prev) => {
        const existing = prev.findIndex(
          (score) =>
            score.studentId === studentId &&
            score.eventId === eventId &&
            score.judgeId === judgeId,
        );

        const optimisticScore: Score = {
          id: existing >= 0 ? prev[existing].id : `tmp-score-${Date.now()}`,
          studentId,
          judgeId,
          eventId,
          category,
          delivery: s.delivery,
          content: s.content,
          language: s.language,
          presentation: s.presentation,
          total: calculateWeightedTotal(s, category),
        };

        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = optimisticScore;
          return updated;
        }

        return [...prev, optimisticScore];
      });

      try {
        const saved = await submitScoreRequest({
          studentId,
          judgeId,
          eventId,
          category,
          delivery: s.delivery,
          content: s.content,
          language: s.language,
          presentation: s.presentation,
        });

        setScores((prev) => {
          const existing = prev.findIndex((score) => score.id === saved.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = saved;
            return updated;
          }

          const fallback = prev.findIndex(
            (score) =>
              score.studentId === saved.studentId &&
              score.eventId === saved.eventId &&
              score.judgeId === saved.judgeId,
          );

          if (fallback >= 0) {
            const updated = [...prev];
            updated[fallback] = saved;
            return updated;
          }

          return [...prev, saved];
        });

        return { ok: true };
      } catch (error) {
        setScores(previous);
        console.error("Failed to submit score", error);
        return {
          ok: false,
          message: isApiError(error)
            ? error.message
            : "Could not submit scores. Please try again.",
        };
      }
    },
    [scores, user?.id],
  );

  const getLeaderboard = useCallback(
    (eventId: string, category?: Category) => {
      const eventScores = scores.filter(
        (score) =>
          score.eventId === eventId &&
          (!category || score.category === category),
      );
      const entries = eventScores.map((score) => {
        const student = students.find((st) => st.id === score.studentId);
        const school = schools.find((sc) => sc.id === student?.schoolId);
        return {
          studentId: student?.id || "",
          rank: 0,
          grade: student?.grade || "Unknown",
          gradeRank: 0,
          studentName: student?.name || "Unknown",
          schoolName: school?.shortName || "?",
          schoolColor: school?.color || "#999",
          category: score.category,
          avgScore: score.total,
          scores: {
            delivery: score.delivery,
            content: score.content,
            language: score.language,
            presentation: score.presentation,
          },
        };
      });
      entries.sort((a, b) => b.avgScore - a.avgScore);
      const gradeRanks = new Map<string, number>();
      entries.forEach((entry, i) => {
        entry.rank = i + 1;
        const nextGradeRank = (gradeRanks.get(entry.grade) || 0) + 1;
        gradeRanks.set(entry.grade, nextGradeRank);
        entry.gradeRank = nextGradeRank;
      });
      return entries;
    },
    [scores, students, schools],
  );

  return (
    <DataContext.Provider
      value={{
        schools,
        students,
        events,
        scores,
        isSyncing,
        addStudent,
        removeStudent,
        approveSchool,
        rejectSchool,
        addEvent,
        updateEvent,
        updateEventStatus,
        submitScore,
        getLeaderboard,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
