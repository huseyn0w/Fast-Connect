const NAME_KEY = "fast-connect:name";

/** Remembers the participant's display name across reloads within a tab. */
export const session = {
  getName(): string {
    try {
      return sessionStorage.getItem(NAME_KEY) ?? "";
    } catch {
      return "";
    }
  },
  setName(name: string): void {
    try {
      sessionStorage.setItem(NAME_KEY, name);
    } catch {
      /* storage unavailable (private mode) — degrade gracefully */
    }
  },
};
