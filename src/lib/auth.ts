import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins"; // ✅ ADD THIS
import { prisma } from "./prisma.js";
import { transporter } from "./mailer.js";

const origin_url = process.env.SEED_API_ORIGIN ?? "http://localhost:3000";
const auth_base_url =
  process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:4000";

export const auth = betterAuth({
  baseURL: auth_base_url,

  // ✅ MUST: frontend origin allowed
  trustedOrigins: [origin_url],

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

  // ✅ Email + Password
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // ✅ Google OAuth
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // ✅ Email Verification via Nodemailer
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: "Verify your email",
        html: `
          <h2>Verify your email</h2>
          <p>Click the link below to verify your account:</p>
          <a href="http://localhost:3000/">${url}</a>
        `,
      });
    },
  },

  // ✅ ADD THIS: inject providerId into session response
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
          providerId: provider?.id ?? null, // ✅ now appears in getSession()
        },
      };
    }),
  ],

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      //extra
      path: "/",
    },
    trustProxy: true,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          // extra
          path: "/",
        },
      },
    },
  },
});

// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "./prisma";
// import { transporter } from "./mailer";

// export const auth = betterAuth({
//   baseURL: "http://localhost:4000",

//   // ✅ MUST: frontend origin allowed
//   trustedOrigins: ["http://localhost:3000"],

//   database: prismaAdapter(prisma, {
//     provider: "postgresql", // mysql | postgresql | sqlite
//   }),

//   user: {
//     additionalFields: {
//       role: {
//         type: "string",
//         defaultValue: "CUSTOMER",
//         required: false,
//       },
//       phone: {
//         type: "string",
//         required: false,
//       },
//       status: {
//         type: "string",
//         defaultValue: "ACTIVE",
//         required: false,
//       },
//     },
//   },

//   // ✅ Email + Password
//   emailAndPassword: {
//     enabled: true,

//     // ⚠️ Key name can vary across Better Auth versions
//     // If TS complains, send: npm ls better-auth
//     requireEmailVerification: true,
//   },

//   // ✅ Google OAuth
//   socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     },
//   },

//   // ✅ Email Verification via Nodemailer
//   emailVerification: {
//     sendVerificationEmail: async ({ user, url }) => {
//       await transporter.sendMail({
//         from: process.env.EMAIL_FROM!,
//         to: user.email,
//         subject: "Verify your email",
//         html: `
//           <h2>Verify your email</h2>
//           <p>Click the link below to verify your account:</p>
//           <a href="http://localhost:3000/">${url}</a>
//         `,
//       });
//     },
//   },
// });
