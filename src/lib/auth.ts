import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getOAuthState } from "better-auth/api";
import { customSession } from "better-auth/plugins";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [
    process.env.NEXT_PUBLIC_CLIENT_URL ?? "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      scope: ["repo"],
    },
  },
  user: {
    additionalFields: {
      ability: {
        type: "string",
        required: true,
        defaultValue: "non-blind",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          if (!ctx || ctx.path !== "/callback/:id") {
            return { data: user };
          }

          const state = (await getOAuthState()) as
            | { ability?: string }
            | null
            | undefined;

          return {
            data: {
              ...user,
              ability: state?.ability ?? "non-blind",
            },
          };
        },
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
          ability: (user as any).ability,
        },
        session,
      };
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
