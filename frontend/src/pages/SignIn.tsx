import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { isApiError, loginRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  School,
  GraduationCap,
  Gavel,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("school");
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithUser } = useAuth();
  const navigate = useNavigate();

  const roleConfig: Record<
    Exclude<UserRole, "guest">,
    {
      icon: typeof Shield;
      title: string;
      description: string;
      path: string;
      color: string;
      accent: string;
    }
  > = {
    admin: {
      icon: Shield,
      title: "Admin Portal",
      description: "Manage events, schools, and system settings",
      path: "/admin",
      color: "text-red-500",
      accent: "border-red-200 bg-red-50/70",
    },
    school: {
      icon: School,
      title: "School Portal",
      description: "Register students and track your school's progress",
      path: "/school",
      color: "text-blue-500",
      accent: "border-blue-200 bg-blue-50/70",
    },
    student: {
      icon: GraduationCap,
      title: "Student Portal",
      description: "View published results and follow the leaderboard",
      path: "/student",
      color: "text-emerald-500",
      accent: "border-emerald-200 bg-emerald-50/70",
    },
    judge: {
      icon: Gavel,
      title: "Judges Panel",
      description: "Score performances and contribute to fair judging",
      path: "/judge",
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginRequest({
        email,
        password,
        role: selectedRole,
      });

      loginWithUser(response.user);
      const roleKey =
        response.user.role in roleConfig
          ? (response.user.role as keyof typeof roleConfig)
          : (selectedRole as keyof typeof roleConfig);
      navigate(roleConfig[roleKey].path);
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
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <Card className="border-6 shadow-xl shadow-slate-900/5">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-display">Sign In</CardTitle>
              <CardDescription>
                Choose your role and sign in to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Select Access Type
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
                      {selectedRole === "school" && (
                        <p className="mt-2 text-xs font-medium text-muted-foreground">
                          Sign in with your school account email and password.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
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

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg text-xs">
                <p className="font-semibold mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-muted-foreground">
                  <p>Admin: admin@sparkle.edu / admin123</p>
                  <p>School Account: school@sgis.edu / school123</p>
                  <p>Student: student@sparkle.edu / student123</p>
                  <p>Judges: judge@panel.edu / judge123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
