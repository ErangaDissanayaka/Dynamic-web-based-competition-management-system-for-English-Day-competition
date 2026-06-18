import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/lib/data-store";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_EVENT_CATEGORIES,
  GRADE_OPTIONS,
  getAllowedGradesForCategory,
  getCategoryGradeBand,
  getCategoryIcon,
  getCategoryLabel,
  getMaxSlotsForCategory,
  isDramaCategory,
  getOrderedCategories,
  isGradeAllowedForCategory,
  type Category,
} from "@/lib/types";
import { isDeadlinePassed } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, Plus, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const normalizeComparableText = (value: string | undefined | null) =>
  String(value || "")
    .trim()
    .toLowerCase();

export default function SchoolDashboard() {
  const { user } = useAuth();
  const { schools, students, events, addStudent, removeStudent, isSyncing } =
    useData();
  const normalizedAccountName = normalizeComparableText(user?.name);
  const school =
    schools.find((s) => s.id === user?.schoolId) ||
    schools.find((s) => {
      if (!normalizedAccountName) {
        return false;
      }

      return (
        normalizeComparableText(s.name) === normalizedAccountName ||
        normalizeComparableText(s.shortName) === normalizedAccountName
      );
    }) ||
    null;
  const currentEvent =
    events.find((e) => e.status === "registration_open") ||
    events[events.length - 1] ||
    null;
  const myStudents =
    school && currentEvent
      ? students.filter(
          (s) => s.schoolId === school.id && s.eventId === currentEvent.id,
        )
      : [];

  const categories = getOrderedCategories(
    currentEvent?.categories?.length
      ? currentEvent.categories
      : DEFAULT_EVENT_CATEGORIES,
  );

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addCategory, setAddCategory] = useState<Category>(
    DEFAULT_EVENT_CATEGORIES[0],
  );
  const [newName, setNewName] = useState("");
  const [newGrade, setNewGrade] = useState("Grade 6");
  const allowedGrades = getAllowedGradesForCategory(addCategory);

  // Check if registration deadline has passed
  const registrationDeadlinePassed = currentEvent
    ? isDeadlinePassed(currentEvent.registrationDeadline)
    : false;

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(addCategory)) {
      setAddCategory(categories[0]);
    }
  }, [addCategory, categories]);

  useEffect(() => {
    if (allowedGrades.length > 0 && !allowedGrades.includes(newGrade)) {
      setNewGrade(allowedGrades[0]);
    }
  }, [allowedGrades, newGrade]);

  const handleAdd = async () => {
    if (!school) {
      toast.error(
        "Your school account could not be matched. Please sign in again.",
      );
      return;
    }

    if (!currentEvent) {
      toast.error("No event is available for registration right now.");
      return;
    }

    if (registrationDeadlinePassed) {
      toast.error(
        `Registration for this event closed on ${new Date(currentEvent.registrationDeadline).toLocaleDateString()}. No new registrations are accepted.`,
      );
      return;
    }

    if (!newName.trim()) {
      toast.error("Please enter a student name");
      return;
    }
    const catStudents = myStudents.filter((s) => s.category === addCategory);
    const maxSlots = getMaxSlotsForCategory(addCategory);
    if (catStudents.length >= maxSlots) {
      toast.error(
        `Maximum ${maxSlots} students for ${getCategoryLabel(addCategory)} reached`,
      );
      return;
    }
    if (!isGradeAllowedForCategory(addCategory, newGrade)) {
      toast.error(
        `${getCategoryLabel(addCategory)} is limited to ${getCategoryGradeBand(addCategory)}`,
      );
      return;
    }

    const result = await addStudent({
      name: newName.trim(),
      schoolId: school.id,
      category: addCategory,
      eventId: currentEvent.id,
      grade: newGrade,
    });
    if (!result.ok) {
      toast.error(
        result.message || "Could not register student. Please try again.",
      );
      return;
    }

    toast.success(
      `${newName.trim()} registered for ${getCategoryLabel(addCategory)}`,
    );
    setNewName("");
    setAddDialogOpen(false);
  };

  const handleRemove = async (id: string, name: string) => {
    const ok = await removeStudent(id);
    if (!ok) {
      toast.error("Could not remove student. Please try again.");
      return;
    }

    toast.info(`${name} removed`);
  };

  if (!school && isSyncing) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">
                Loading School Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Syncing your account with the latest school records...
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!school) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">School Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your account is approved, but no matching school profile was
                found. Sign out and sign in again, or ask an admin to relink
                your school account.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentEvent) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">No Active Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No competition event is available yet. Ask an admin to create or
                open registration for an event.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: school.color + "20" }}
          >
            {school.logo}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">{school.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={currentEvent.status} />
              <span className="text-sm text-muted-foreground">
                {currentEvent.name}
              </span>
            </div>
          </div>
        </div>

        {/* Registration Deadline Alert */}
        {registrationDeadlinePassed && (
          <Alert className="mb-8 border-destructive bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              Registration for {currentEvent.name} closed on{" "}
              {new Date(currentEvent.registrationDeadline).toLocaleDateString()}
              . No new registrations are being accepted.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Users size={20} className="text-accent" />
              <div>
                <p className="text-2xl font-bold">{myStudents.length}</p>
                <p className="text-sm text-muted-foreground">
                  Registered Students
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Calendar size={20} className="text-info" />
              <div>
                <p className="text-sm font-semibold">
                  {new Date(currentEvent.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">Event Date</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Calendar size={20} className="text-warning" />
              <div>
                <p className="text-sm font-semibold">
                  {new Date(
                    currentEvent.registrationDeadline,
                  ).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Registration Deadline
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Student Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                Register Student
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Student Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={addCategory}
                  onValueChange={(v) => setAddCategory(v as Category)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {getCategoryLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-xs text-muted-foreground">
                  {getCategoryGradeBand(addCategory)}
                </p>
              </div>
              <div>
                <Label>Grade</Label>
                <Select value={newGrade} onValueChange={setNewGrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.filter((grade) =>
                      allowedGrades.includes(grade),
                    ).map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-xs text-muted-foreground">
                  Eligible grades: {getCategoryGradeBand(addCategory)}
                </p>
              </div>
              <Button
                className="w-full gold-gradient text-secondary-foreground"
                onClick={handleAdd}
                disabled={registrationDeadlinePassed}
              >
                Register Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Categories */}
        <h2 className="font-display text-xl font-bold mb-4">
          Registration by Category
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {categories.map((cat, i) => {
            const catStudents = myStudents.filter((s) => s.category === cat);
            const maxSlots = getMaxSlotsForCategory(cat);
            let spotsLeft = maxSlots - catStudents.length;
            let displayText = `${spotsLeft} spots left`;
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-2xl">{getCategoryIcon(cat)}</span>
                      {getCategoryLabel(cat)}
                      <span className="ml-auto text-xs font-normal text-muted-foreground">
                        {catStudents.length}/{maxSlots} slots
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-xs text-muted-foreground">
                      {getCategoryGradeBand(cat)}
                    </p>
                    <div className="space-y-2 mb-4">
                      {catStudents.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div>
                            <p className="font-medium text-sm">{st.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {st.grade}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive text-xs"
                            onClick={() => handleRemove(st.id, st.name)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      {catStudents.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No students registered yet
                        </p>
                      )}
                    </div>
                    {spotsLeft > 0 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                        onClick={() => {
                          setAddCategory(cat);
                          setAddDialogOpen(true);
                        }}
                        disabled={registrationDeadlinePassed}
                      >
                        <Plus size={14} className="mr-1" /> Add Student (
                        {displayText})
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
