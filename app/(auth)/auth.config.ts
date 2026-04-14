import type { NextAuthConfig } from "next-auth";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const authConfig = {
  basePath: "/api/auth",
  trustHost: true,
  logger: {
    error(error) {
      if ("type" in error && error.type === "CredentialsSignin") {
        return;
      }

      console.error(`[auth][error] ${error.name}: ${error.message}`);

      if (error.stack) {
        console.error(error.stack.replace(/.*/, "").slice(1));
      }
    },
  },
  pages: {
    signIn: `${base}/login`,
    newUser: `${base}/`,
  },
  providers: [],
  callbacks: {},
} satisfies NextAuthConfig;
