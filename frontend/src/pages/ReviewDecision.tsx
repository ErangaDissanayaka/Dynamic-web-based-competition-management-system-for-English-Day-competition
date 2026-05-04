import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

const REVIEW_API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

type DecisionState =
  | { status: "loading" }
  | {
      status: "success";
      title: string;
      message: string;
      tone: "success" | "info";
    }
  | { status: "error"; title: string; message: string };

export default function ReviewDecision() {
  const { userId, decision } = useParams<{
    userId: string;
    decision: string;
  }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<DecisionState>({ status: "loading" });

  useEffect(() => {
    if (!userId || !decision) {
      setState({
        status: "error",
        title: "Invalid Review Link",
        message: "This review link is missing required information.",
      });
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    fetch(
      `${REVIEW_API_BASE_URL}/admin/registrations/${encodeURIComponent(userId)}/${encodeURIComponent(decision)}?token=${encodeURIComponent(token)}`,
      {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      },
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setState({
            status: "error",
            title: data.title ?? "Review Error",
            message:
              data.message ??
              "Something went wrong processing this review link.",
          });
        } else {
          setState({
            status: "success",
            title: data.title,
            message: data.message,
            tone: data.tone === "info" ? "info" : "success",
          });
        }
      })
      .catch(() => {
        setState({
          status: "error",
          title: "Connection Error",
          message:
            "Could not reach the server. Make sure the backend is running.",
        });
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [userId, decision, token]);

  const accentColor =
    state.status === "loading"
      ? "#1d4ed8"
      : state.status === "error"
        ? "#b91c1c"
        : state.status === "success" && state.tone === "info"
          ? "#1d4ed8"
          : "#166534";

  const icon =
    state.status === "loading"
      ? "⏳"
      : state.status === "error"
        ? "✗"
        : state.status === "success" && state.tone === "info"
          ? "ℹ"
          : "✓";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white"
          style={{ background: accentColor }}
        >
          {icon}
        </div>

        {state.status === "loading" ? (
          <>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Processing…
            </h1>
            <p className="text-muted-foreground">
              Applying the review decision, please wait.
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              {state.title}
            </h1>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              {state.message}
            </p>
            <Link
              to="/signin"
              className="inline-block rounded-xl px-5 py-3 font-semibold text-white"
              style={{ background: "#172554" }}
            >
              Open Admin Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
