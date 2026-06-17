import "dotenv/config";

/**
 * Centralised, validated runtime configuration.
 * Fails fast on obviously bad input so misconfiguration surfaces at boot,
 * not mid-call.
 */
function readPort(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`Invalid PORT value: "${value}"`);
  }
  return parsed;
}

function readOrigins(value: string | undefined): string[] | "*" {
  if (!value || value.trim() === "*") return "*";
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  // `||` (not `??`) so empty-string env vars fall back to the default too.
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: readPort(process.env.PORT, 5000),
  /** Allowed browser origins. "*" only intended for local development. */
  corsOrigins: readOrigins(process.env.CORS_ORIGINS),
  /** Path the PeerJS broker is mounted under. */
  peerPath: process.env.PEER_PATH || "/peerjs",
} as const;

export type AppConfig = typeof config;
