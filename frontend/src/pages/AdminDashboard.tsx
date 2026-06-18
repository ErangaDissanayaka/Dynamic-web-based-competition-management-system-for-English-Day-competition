import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/lib/data-store";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Trophy,
  Users,
  Calendar,
  School,
  Plus,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_EVENT_CATEGORIES,
  getCategoryIcon,
  getCategoryLabel,
  getOrderedCategories,
  type Event,
  type Category,
  type EventStatus,
  type School as SchoolRecord,
  type Score as ScoreRecord,
  type Student,
} from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type EventFormState = {
  name: string;
  year: number;
  date: string;
  venue: string;
  registrationDeadline: string;
  selectedCategories: Category[];
  customCategories: string[];
};

const createEmptyEventForm = (): EventFormState => ({
  name: "",
  year: 2026,
  date: "",
  venue: "",
  registrationDeadline: "",
  selectedCategories: [...DEFAULT_EVENT_CATEGORIES],
  customCategories: [],
});

function EventFormFields({
  form,
  setForm,
  customCategoryInput,
  setCustomCategoryInput,
}: {
  form: EventFormState;
  setForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  customCategoryInput: string;
  setCustomCategoryInput: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div
      className="overflow-y-auto px-5 py-3 space-y-3"
      style={{ maxHeight: "calc(75vh - 130px)" }}
    >
      <div>
        <Label>Event Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="English Day 2027"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Year</Label>
          <Input
            type="number"
            value={form.year}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                year: Number.parseInt(e.target.value, 10) || 2026,
              }))
            }
          />
        </div>
        <div>
          <Label>Event Date</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label>Venue</Label>
        <Input
          value={form.venue}
          onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
          placeholder="Grand Convention Centre"
        />
      </div>
      <div>
        <Label>Registration Deadline</Label>
        <Input
          type="date"
          value={form.registrationDeadline}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              registrationDeadline: e.target.value,
            }))
          }
        />
      </div>
      <div>
        <Label>Categories</Label>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {DEFAULT_EVENT_CATEGORIES.map((cat) => {
            const checked = form.selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    selectedCategories: checked
                      ? p.selectedCategories.filter((c) => c !== cat)
                      : [...p.selectedCategories, cat],
                  }))
                }
                className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${
                  checked
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                }`}
              >
                <span className="shrink-0 text-sm">{getCategoryIcon(cat)}</span>
                <span className="flex-1 text-left leading-tight line-clamp-1">
                  {getCategoryLabel(cat)}
                </span>
                {checked && <Check size={12} className="shrink-0" />}
              </button>
            );
          })}
        </div>
        {form.customCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.customCategories.map((cat) => (
              <span
                key={cat}
                className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 text-primary px-3 py-1 text-sm font-medium"
              >
                {cat}
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      customCategories: p.customCategories.filter(
                        (c) => c !== cat,
                      ),
                    }))
                  }
                  className="ml-1 text-primary/60 hover:text-primary"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Add custom category…"
            value={customCategoryInput}
            onChange={(e) => setCustomCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = customCategoryInput.trim();
                if (
                  val &&
                  !form.customCategories.includes(val) &&
                  !form.selectedCategories.includes(val)
                ) {
                  setForm((p) => ({
                    ...p,
                    customCategories: [...p.customCategories, val],
                  }));
                  setCustomCategoryInput("");
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => {
              const val = customCategoryInput.trim();
              if (
                val &&
                !form.customCategories.includes(val) &&
                !form.selectedCategories.includes(val)
              ) {
                setForm((p) => ({
                  ...p,
                  customCategories: [...p.customCategories, val],
                }));
                setCustomCategoryInput("");
              }
            }}
          >
            <Plus size={14} className="mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

function EventDialog({
  open,
  onOpenChange,
  mode,
  form,
  setForm,
  customCategoryInput,
  setCustomCategoryInput,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  form: EventFormState;
  setForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  customCategoryInput: string;
  setCustomCategoryInput: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-xl p-0 gap-0">
        <DialogHeader className="px-5 pt-4 pb-3 border-b">
          <DialogTitle className="font-display">
            {mode === "create" ? "Create New Event" : "Edit Event"}
          </DialogTitle>
        </DialogHeader>
        <EventFormFields
          form={form}
          setForm={setForm}
          customCategoryInput={customCategoryInput}
          setCustomCategoryInput={setCustomCategoryInput}
        />
        <div className="px-5 py-3 border-t">
          <Button
            className="w-full gold-gradient text-secondary-foreground"
            onClick={onSubmit}
          >
            {mode === "create" ? "Create Event" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Sub-components to keep file manageable ---

function StatsGrid({
  events,
  schools,
  students,
  categories,
}: {
  events: Event[];
  schools: SchoolRecord[];
  students: Student[];
  categories: Category[];
}) {
  const stats = [
    {
      label: "Total Events",
      value: events.length,
      icon: Calendar,
      color: "text-info",
    },
    {
      label: "Schools",
      value: schools.filter((school) => school.approved).length,
      icon: School,
      color: "text-success",
    },
    {
      label: "Students",
      value: students.length,
      icon: Users,
      color: "text-accent",
    },
    {
      label: "Categories",
      value: categories.length,
      icon: Trophy,
      color: "text-gold",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${s.color}`}
              >
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function CategoryTabContent({
  category,
  students,
  schools,
  scores,
}: {
  category: Category;
  students: Student[];
  schools: SchoolRecord[];
  scores: ScoreRecord[];
}) {
  const categoryStudents = students.filter(
    (student) => student.category === category,
  );
  const categoryScores = scores.filter((score) => score.category === category);

  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl mb-1">{getCategoryIcon(category)}</p>
            <p className="text-2xl font-bold">{categoryStudents.length}</p>
            <p className="text-sm text-muted-foreground">Registered Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl mb-1">🏫</p>
            <p className="text-2xl font-bold">
              {
                new Set(categoryStudents.map((student) => student.schoolId))
                  .size
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Participating Schools
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl mb-1">📝</p>
            <p className="text-2xl font-bold">{categoryScores.length}</p>
            <p className="text-sm text-muted-foreground">Scores Submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">
            {getCategoryIcon(category)} {getCategoryLabel(category)} — Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryStudents.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No students registered in this category yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">#</th>
                    <th className="text-left py-3 px-4 font-medium">Student</th>
                    <th className="text-left py-3 px-4 font-medium">School</th>
                    <th className="text-left py-3 px-4 font-medium">Grade</th>
                    <th className="text-left py-3 px-4 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStudents.map((student, idx) => {
                    const school = schools.find(
                      (schoolEntry) => schoolEntry.id === student.schoolId,
                    );
                    const score = categoryScores.find(
                      (scoreEntry) => scoreEntry.studentId === student.id,
                    );
                    return (
                      <tr
                        key={student.id}
                        className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {student.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: school?.color }}
                            />
                            {school?.shortName || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {student.grade}
                        </td>
                        <td className="py-3 px-4">
                          {score ? (
                            <span className="font-semibold text-gold">
                              {score.total}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const {
    events,
    schools,
    students,
    scores,
    addEvent,
    updateEvent,
    approveSchool,
    rejectSchool,
    updateEventStatus,
  } = useData();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const location = useLocation();
  const navigate = useNavigate();
  const { eventId: routeEventId } = useParams();

  useEffect(() => {
    if (location.pathname.startsWith("/admin/events")) {
      setActiveTab("overview");
      window.setTimeout(() => {
        document
          .getElementById("events-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    } else if (location.pathname === "/admin/schools") {
      setActiveTab("overview");
      window.setTimeout(() => {
        document
          .getElementById("schools-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    } else if (location.pathname === "/admin") {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!routeEventId || editingEventId === routeEventId) {
      return;
    }

    const eventToEdit = events.find((event) => event.id === routeEventId);
    if (eventToEdit) {
      openEditEventDialog(eventToEdit);
    }
  }, [editingEventId, events, routeEventId]);

  const [eventForm, setEventForm] = useState<EventFormState>(
    createEmptyEventForm(),
  );

  const parseEventTime = (value: string) => new Date(value).getTime();
  const now = Date.now();
  const currentEvent =
    events
      .filter(
        (event) =>
          event.status !== "results_published" &&
          parseEventTime(event.date) >= now,
      )
      .sort(
        (left, right) => parseEventTime(left.date) - parseEventTime(right.date),
      )[0] ||
    [...events].sort(
      (left, right) => parseEventTime(right.date) - parseEventTime(left.date),
    )[0];

  const registeredSchoolIds = new Set(
    students
      .filter((student) => student.eventId === currentEvent?.id)
      .map((student) => student.schoolId),
  );
  const registeredSchools = schools.filter((school) =>
    registeredSchoolIds.has(school.id),
  );

  const allCategories = getOrderedCategories([
    ...DEFAULT_EVENT_CATEGORIES,
    ...events.flatMap((event) => event.categories),
    ...students.map((student) => student.category),
    ...scores.map((score) => score.category),
  ]);

  const resetEventDialog = () => {
    setEventDialogOpen(false);
    setEditingEventId(null);
    setEventForm(createEmptyEventForm());
    setCustomCategoryInput("");
  };

  const closeEventDialog = () => {
    if (routeEventId) {
      resetEventDialog();
      navigate("/admin/events");
      return;
    }

    resetEventDialog();
  };

  const openCreateEventDialog = () => {
    setEditingEventId(null);
    setEventForm(createEmptyEventForm());
    setCustomCategoryInput("");
    setEventDialogOpen(true);
  };

  const openEditEventDialog = (event: Event) => {
    setEditingEventId(event.id);
    setEventForm({
      name: event.name,
      year: event.year,
      date: event.date,
      venue: event.venue,
      registrationDeadline: event.registrationDeadline,
      selectedCategories: [...event.categories],
      customCategories: [],
    });
    setCustomCategoryInput("");
    setEventDialogOpen(true);

    if (routeEventId !== event.id) {
      navigate(`/admin/events/${event.id}/edit`, { replace: true });
    }
  };

  const handleSaveEvent = async () => {
    if (
      !eventForm.name ||
      !eventForm.date ||
      !eventForm.venue ||
      !eventForm.registrationDeadline
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    if (
      eventForm.selectedCategories.length +
        eventForm.customCategories.length ===
      0
    ) {
      toast.error("Please select at least one category");
      return;
    }
    const eventPayload = {
      name: eventForm.name,
      year: eventForm.year,
      date: eventForm.date,
      venue: eventForm.venue,
      registrationDeadline: eventForm.registrationDeadline,
      categories: [
        ...eventForm.selectedCategories,
        ...eventForm.customCategories,
      ],
    };

    if (editingEventId) {
      const ok = await updateEvent(editingEventId, eventPayload);
      if (!ok) {
        toast.error("Could not update event. Please try again.");
        return;
      }

      toast.success(`Event "${eventForm.name}" updated!`);
      resetEventDialog();
      navigate("/admin/events");
      return;
    }

    const result = await addEvent({
      ...eventPayload,
      status: "upcoming" as EventStatus,
    });
    if (!result.ok) {
      toast.error("Could not create event. Please try again.");
      return;
    }

    if (result.notifications?.status === "sent") {
      toast.success(
        `Event "${eventForm.name}" created. ${result.notifications.message}`,
      );
    } else if (result.notifications) {
      toast.warning(
        `Event "${eventForm.name}" created. ${result.notifications.message}`,
      );
    } else {
      toast.success(`Event "${eventForm.name}" created!`);
    }

    resetEventDialog();
  };

  const handleApprove = async (id: string, name: string) => {
    const ok = await approveSchool(id);
    if (!ok) {
      toast.error("Could not approve school. Please try again.");
      return;
    }

    toast.success(`${name} approved!`);
  };

  const handleReject = async (id: string, name: string) => {
    const ok = await rejectSchool(id);
    if (!ok) {
      toast.error("Could not remove school. Please try again.");
      return;
    }

    toast.info(`${name} removed`);
  };

  const cycleStatus = async (id: string, current: EventStatus) => {
    const order: EventStatus[] = [
      "upcoming",
      "registration_open",
      "registration_closed",
      "judging_live",
      "results_published",
    ];
    const next = order[(order.indexOf(current) + 1) % order.length];
    const ok = await updateEventStatus(id, next);
    if (!ok) {
      toast.error("Could not update event status. Please try again.");
      return;
    }

    toast.success(`Status updated to "${next.replace(/_/g, " ")}"`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage competitions, schools, and events
          </p>
        </div>

        <StatsGrid
          events={events}
          schools={schools}
          students={students}
          categories={allCategories}
        />

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-xl">
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              📋 Overview
            </TabsTrigger>
            {allCategories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {getCategoryIcon(cat)} {getCategoryLabel(cat)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Events */}
            <Card id="events-section">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display">Events</CardTitle>
                <Button
                  size="sm"
                  className="gold-gradient text-secondary-foreground"
                  onClick={openCreateEventDialog}
                >
                  <Plus size={16} className="mr-1" /> New Event
                </Button>
              </CardHeader>
              <EventDialog
                open={eventDialogOpen}
                onOpenChange={(open) => {
                  if (!open) {
                    closeEventDialog();
                    return;
                  }
                  setEventDialogOpen(true);
                }}
                mode={editingEventId ? "edit" : "create"}
                form={eventForm}
                setForm={setEventForm}
                customCategoryInput={customCategoryInput}
                setCustomCategoryInput={setCustomCategoryInput}
                onSubmit={handleSaveEvent}
              />
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-4 font-medium">
                          Event
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Venue
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Categories
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((e) => (
                        <tr
                          key={e.id}
                          className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium">{e.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(e.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {e.venue}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => cycleStatus(e.id, e.status)}
                              title="Click to change status"
                            >
                              <StatusBadge status={e.status} />
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              {e.categories.map((c) => (
                                <span
                                  key={c}
                                  className="text-xs bg-muted px-2 py-0.5 rounded-full"
                                >
                                  {getCategoryLabel(c)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditEventDialog(e)}
                            >
                              <Pencil size={14} className="mr-1" /> Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Schools */}
            <Card id="schools-section">
              <CardHeader>
                <CardTitle className="font-display">
                  Registered Schools
                </CardTitle>
                {currentEvent && (
                  <p className="text-sm text-muted-foreground">
                    Showing schools registered for {currentEvent.name}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {registeredSchools.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: s.color + "20" }}
                      >
                        {s.logo}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {s.shortName}
                        </p>
                      </div>
                      {s.approved ? (
                        <span className="flex items-center gap-1 text-xs text-success font-medium">
                          <Check size={14} /> Approved
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-success border-success/30 hover:bg-success/10"
                            onClick={() => handleApprove(s.id, s.name)}
                          >
                            <Check size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleReject(s.id, s.name)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {registeredSchools.length === 0 && (
                    <p className="col-span-full text-sm text-muted-foreground text-center py-4">
                      No schools have registered students for the current event
                      yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Tabs */}
          {allCategories.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <CategoryTabContent
                category={cat}
                students={students}
                schools={schools}
                scores={scores}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
