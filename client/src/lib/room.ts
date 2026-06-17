/** Helpers for generating and normalising room identifiers. */

const SLUG = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Generates a short, URL-safe, human-shareable room id (e.g. "swift-otter-4821"). */
export function generateRoomId(): string {
  const adjectives = ["calm", "swift", "lunar", "bright", "cosmic", "quiet", "noble", "rapid"];
  const nouns = ["otter", "comet", "harbor", "falcon", "willow", "ember", "delta", "summit"];
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
  const suffix = Array.from({ length: 4 }, () => SLUG[Math.floor(Math.random() * SLUG.length)]).join("");
  return `${pick(adjectives)}-${pick(nouns)}-${suffix}`;
}

/** Normalises arbitrary user input into a safe room id, or null if unusable. */
export function normaliseRoomId(input: string): string | null {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 64);
  return cleaned.length > 0 ? cleaned : null;
}
