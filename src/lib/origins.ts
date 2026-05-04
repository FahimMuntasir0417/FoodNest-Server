const defaultClientOrigins = [
  "https://food-nest-client.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function splitOrigins(value: string | undefined) {
  return value?.split(",") ?? [];
}

export function normalizeOrigin(origin: string | undefined) {
  const trimmed = origin?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

export function getAllowedOrigins(...extraOrigins: Array<string | undefined>) {
  const origins = [
    ...splitOrigins(process.env.SEED_API_ORIGIN),
    ...splitOrigins(process.env.SEED_API_ORIGINS),
    ...extraOrigins,
    ...defaultClientOrigins,
  ];

  return Array.from(
    new Set(
      origins
        .map(normalizeOrigin)
        .filter((origin): origin is string => Boolean(origin)),
    ),
  );
}

export const allowedOrigins = getAllowedOrigins();

export function isAllowedOrigin(origin: string) {
  const normalizedOrigin = normalizeOrigin(origin);

  return Boolean(
    normalizedOrigin && allowedOrigins.includes(normalizedOrigin),
  );
}
