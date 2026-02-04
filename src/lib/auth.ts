import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { transporter } from "./mailer";

export const auth = betterAuth({
  baseURL: "http://localhost:4000",

  // ✅ MUST: frontend origin allowed
  trustedOrigins: ["http://localhost:3000"],

  database: prismaAdapter(prisma, {
    provider: "postgresql", // mysql | postgresql | sqlite
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

    // ⚠️ Key name can vary across Better Auth versions
    // If TS complains, send: npm ls better-auth
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
});
