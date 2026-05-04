import type { UserRole } from "./types";

export function getHomePathForRole(role: UserRole) {
  switch (role) {
    case "admin":
      return "/admin";
    case "school":
      return "/school";
    case "student":
      return "/student";
    case "judge":
      return "/judge";
    default:
      return "/";
  }
}

export function getRoleLabel(role: UserRole) {
  switch (role) {
    case "admin":
      return "Super Admin";
    case "school":
      return "School Rep";
    case "student":
      return "Student";
    case "judge":
      return "Judge";
    default:
      return "Guest";
  }
}
