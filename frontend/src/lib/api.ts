import type {
  Category,
  Event,
  EventNotificationSummary,
  EventStatus,
  School,
  Score,
  Student,
  UserRole,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  judgeCategory?: string;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : "Request failed. Please try again.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export async function loginRequest(input: {
  email: string;
  password: string;
  role: UserRole;
}) {
  return apiRequest<{ message: string; user: BackendUser; token: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function registerRequest(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  schoolShortName?: string;
  judgeCategory?: string;
}) {
  return apiRequest<{ message: string; user: BackendUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchSchoolsRequest() {
  return apiRequest<School[]>("/schools", {
    method: "GET",
  });
}

export function fetchEventsRequest() {
  return apiRequest<Event[]>("/events", {
    method: "GET",
  });
}

export function fetchStudentsRequest() {
  return apiRequest<Student[]>("/students", {
    method: "GET",
  });
}

export function fetchScoresRequest() {
  return apiRequest<Score[]>("/scores", {
    method: "GET",
  });
}

export function createStudentRequest(input: Omit<Student, "id">) {
  return apiRequest<Student>("/students", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteStudentRequest(studentId: string) {
  return apiRequest<Student>(`/students/${studentId}`, {
    method: "DELETE",
  });
}

export function approveSchoolRequest(schoolId: string) {
  return apiRequest<School>(`/schools/${schoolId}/approve`, {
    method: "PATCH",
  });
}

export function rejectSchoolRequest(schoolId: string) {
  return apiRequest<School>(`/schools/${schoolId}`, {
    method: "DELETE",
  });
}

export function createEventRequest(input: Omit<Event, "id">) {
  return apiRequest<{ event: Event; notifications: EventNotificationSummary }>(
    "/events",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function updateEventRequest(
  eventId: string,
  input: Omit<Event, "id" | "status">,
) {
  return apiRequest<Event>(`/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function updateEventStatusRequest(eventId: string, status: EventStatus) {
  return apiRequest<Event>(`/events/${eventId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function submitScoreRequest(input: {
  studentId: string;
  judgeId: string;
  eventId: string;
  category: Category;
  delivery: number;
  content: number;
  language: number;
  presentation: number;
}) {
  return apiRequest<Score>("/scores", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
