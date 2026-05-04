import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";
import { prisma } from "./prisma.js";
import { getAllowedOrigins, normalizeOrigin } from "./origins.js";

const defaultAuthBaseUrl =
  normalizeOrigin(process.env.BETTER_AUTH_BASE_URL) || "http://localhost:4000";

function createAuth(baseURL: string) {
  return betterAuth({
    baseURL,

    trustedOrigins: getAllowedOrigins(defaultAuthBaseUrl),

    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "CUSTOMER",
          required: false,
        },
        phone: {
          type: "string",
          required: false,
        },
        status: {
          type: "string",
          defaultValue: "ACTIVE",
          required: false,
        },
      },
    },

    emailAndPassword: {
      enabled: true,
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        prompt: "select_account",
      },
    },

    plugins: [
      customSession(async ({ user, session }) => {
        const provider = await prisma.providerProfile.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });

        return {
          session,
          user: {
            ...user,
            providerId: provider?.id ?? null,
          },
        };
      }),
    ],

    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
        path: "/",
      },
      trustedProxyHeaders: true,
      cookies: {
        state: {
          attributes: {
            sameSite: "none",
            secure: true,
            path: "/",
          },
        },
      },
    },
  });
}

type AuthInstance = ReturnType<typeof createAuth>;

const authByOrigin = new Map<string, AuthInstance>();

function getOrCreateAuth(baseURL: string) {
  const existingAuth = authByOrigin.get(baseURL);

  if (existingAuth) {
    return existingAuth;
  }

  const authInstance = createAuth(baseURL);
  authByOrigin.set(baseURL, authInstance);

  return authInstance;
}

for (const origin of getAllowedOrigins(defaultAuthBaseUrl)) {
  getOrCreateAuth(origin);
}

export const auth = getOrCreateAuth(defaultAuthBaseUrl);

export function getAuthEntryForOrigin(origin: string | undefined) {
  const requestedOrigin = normalizeOrigin(origin);
  const authOrigin =
    requestedOrigin && authByOrigin.has(requestedOrigin)
      ? requestedOrigin
      : defaultAuthBaseUrl;

  return {
    origin: authOrigin,
    auth: getOrCreateAuth(authOrigin),
  };
}
