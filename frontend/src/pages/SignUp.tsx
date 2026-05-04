import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useData } from "../lib/data-store";
import { isApiError, registerRequest } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Shield,
  School,
  GraduationCap,
  Gavel,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DEFAULT_EVENT_CATEGORIES,
  getCategoryLabel,
  type UserRole,
} from "../lib/types";

export default function SignUp() {
  const { schools } = useData();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    schoolId: "",
    schoolName: "",
    schoolShortName: "",
    judgeCategory: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("school");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const roleConfig: Record<
    Exclude<UserRole, "guest">,
    {
      icon: typeof Shield;
      title: string;
      description: string;
      color: string;
      accent: string;
    }
  > = {
    admin: {
      icon: Shield,
      title: "Admin Registration",
      description: "Request admin access (requires approval)",
      color: "text-red-500",
      accent: "border-red-200 bg-red-50/70",
    },
    school: {
      icon: School,
      title: "School Registration",
      description: "Register your school for the competition",
      color: "text-blue-500",
      accent: "border-blue-200 bg-blue-50/70",
    },
    student: {
      icon: GraduationCap,
      title: "Student Registration",
      description: "Join your school to view results and leaderboard updates",
      color: "text-emerald-500",
      accent: "border-emerald-200 bg-emerald-50/70",
    },
    judge: {
      icon: Gavel,
      title: "Judges Registration",
      description: "Join as a judge panel member",
      color: "text-purple-500",
      accent: "border-violet-200 bg-violet-50/70",
    },
  };

  const roleOptions: Exclude<UserRole, "guest">[] = [
    "school",
    "student",
    "judge",
    "admin",
  ];
  const activeRole = roleConfig[selectedRole as Exclude<UserRole, "guest">];

  const registeredSchools = [...schools].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const accountName =
      selectedRole === "school"
        ? formData.schoolName.trim() || formData.schoolShortName.trim()
        : formData.name.trim();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!accountName) {
      setError(
        selectedRole === "school"
          ? "Please provide school name and short name"
          : "Please provide your full name",
      );
      return;
    }

    if (
      selectedRole === "school" &&
      (!formData.schoolName || !formData.schoolShortName)
    ) {
      setError("Please provide school name and short name");
      return;
    }

    if (selectedRole === "student" && !formData.schoolId) {
      setError("Please select your school");
      return;
    }

    if (selectedRole === "judge" && !formData.judgeCategory) {
      setError("Please select a judging category");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: accountName,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        schoolId: selectedRole === "student" ? formData.schoolId : undefined,
        schoolName: selectedRole === "school" ? formData.schoolName : undefined,
        schoolShortName:
          selectedRole === "school" ? formData.schoolShortName : undefined,
        judgeCategory:
          selectedRole === "judge" ? formData.judgeCategory : undefined,
      };

      const response = await registerRequest(userData);

      // Show success message
      alert(response.message);
      navigate("/signin");
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
      } else {
        setError("Could not reach backend. Start API server and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="navy-gradient text-primary-foreground p-4">
        <div className="container mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm hover:text-gold transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <Card className="border-6 shadow-xl shadow-slate-900/5">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-display">Sign Up</CardTitle>
              <CardDescription>
                Create an account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Select Registration Type
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {roleOptions.map((role) => {
                      const config = roleConfig[role];
                      const isActive = selectedRole === role;

                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            isActive
                              ? `${config.accent} border-primary shadow-sm`
                              : "border-border bg-background hover:border-primary/30 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`rounded-xl border bg-background/80 p-2 ${isActive ? "border-current/10" : "border-border"}`}
                            >
                              <config.icon className={config.color} size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold leading-none text-foreground">
                                {role === "judge"
                                  ? "Judges"
                                  : config.title
                                      .replace(" Portal", "")
                                      .replace(" Registration", "")}
                              </p>
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                {config.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 ${activeRole.accent}`}>
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-background/90 p-3 shadow-sm">
                      <activeRole.icon className={activeRole.color} size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {activeRole.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activeRole.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedRole !== "school" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateFormData("name", e.target.value)
                      }
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateFormData("email", e.target.value)
                    }
                    required
                  />
                </div>

                {/* School-specific fields */}
                {selectedRole === "school" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        type="text"
                        placeholder="Full school name"
                        value={formData.schoolName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateFormData("schoolName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolShortName">School Short Name</Label>
                      <Input
                        id="schoolShortName"
                        type="text"
                        placeholder="e.g., SGIS"
                        value={formData.schoolShortName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateFormData("schoolShortName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </>
                )}

                {selectedRole === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="schoolId">School</Label>
                    <Select
                      value={formData.schoolId}
                      onValueChange={(value: string) =>
                        updateFormData("schoolId", value)
                      }
                    >
                      <SelectTrigger id="schoolId">
                        <SelectValue placeholder="Select your school" />
                      </SelectTrigger>
                      <SelectContent>
                        {registeredSchools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                            {school.approved ? "" : " (Pending approval)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Judge-specific fields */}
                {selectedRole === "judge" && (
                  <div className="space-y-2">
                    <Label htmlFor="judgeCategory">Judging Category</Label>
                    <Select
                      value={formData.judgeCategory}
                      onValueChange={(value: string) =>
                        updateFormData("judgeCategory", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {DEFAULT_EVENT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {getCategoryLabel(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateFormData("password", e.target.value)
                      }
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateFormData("confirmPassword", e.target.value)
                      }
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/signin"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
