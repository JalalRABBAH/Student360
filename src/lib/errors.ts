/** Extract a stable error code from a thrown value (plain string or Error). */
export function errorCode(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  return "ERROR";
}
