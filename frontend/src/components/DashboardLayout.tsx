import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/lib/auth-context";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const hasSidebar = user && user.role !== "guest";

  return (
    <div className="min-h-screen bg-background">
      {hasSidebar && <AppSidebar />}
      <main className={hasSidebar ? "lg:ml-64 min-h-screen" : "min-h-screen"}>
        {children}
      </main>
    </div>
  );
}
