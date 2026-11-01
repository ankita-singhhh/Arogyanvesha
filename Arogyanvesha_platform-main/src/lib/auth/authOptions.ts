
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { getLocalUsers } from "@/lib/localDb";
import { verifyPassword } from "@/lib/crypto";
import {
  authenticateDatabaseCredentials,
  resolveCanonicalUserId,
} from "@/lib/auth/identity";

type GoogleProfile = { email_verified?: unknown };
type SupportedProvider = "credentials" | "google";

type AuthenticatedIdentity = {
  provider: SupportedProvider;
  subject: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
};

function hasVerifiedGoogleEmail(profile: unknown): boolean {
  return (
    typeof profile === "object" &&
    profile !== null &&
    (profile as GoogleProfile).email_verified === true
  );
}

function identityFromCallback(
  account:
    | { provider?: unknown; providerAccountId?: unknown }
    | null
    | undefined,
  user: { id?: unknown; email?: string | null; name?: string | null },
  profile: unknown,
): AuthenticatedIdentity | null {
  if (!account || !user.email) return null;

  if (
    account.provider !== "credentials" &&
    account.provider !== "google"
  ) {
    return null;
  }

  const subject =
    account.provider === "credentials"
      ? user.id
      : account.providerAccountId;

  if (typeof subject !== "string" || !subject) return null;

  const emailVerified =
    account.provider === "google"
      ? hasVerifiedGoogleEmail(profile)
      : false;

  if (account.provider === "google" && !emailVerified) {
    return null;
  }

  return {
    provider: account.provider,
    subject,
    email: user.email,
    emailVerified,
    name: user.name ?? null,
  };
}

function isCanonicalUserId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

const providers: AuthOptions["providers"] = [
  CredentialsProvider({
    id: "credentials",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.toLowerCase().trim();
      const password = credentials?.password;

      if (!email || !password) return null;

      try {
        const databaseUser = await authenticateDatabaseCredentials(
          email,
          password,
        );

        if (databaseUser) {
          return {
            id: databaseUser.subject,
            name: databaseUser.name,
            email: databaseUser.email,
            image: databaseUser.avatarUrl,
            emailVerified: false,
          };
        }
      } catch {
        return null;
      }

      // Transitional legacy JSON support.
      if (process.env.ENABLE_LEGACY_JSON_CREDENTIALS !== "true") {
        return null;
      }

      const localUser = getLocalUsers().find(
        (user) => user.email === email,
      );

      if (
        !localUser ||
        !verifyPassword(password, localUser.passwordHash)
      ) {
        return null;
      }

      return {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        image: localUser.avatarUrl ?? null,
        emailVerified: false,
      };
    },
  }),
];

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: AuthOptions = {
  providers,
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      const identity = identityFromCallback(account, user, profile);

      if (!identity) return false;

      try {
        await resolveCanonicalUserId(identity);
        return true;
      } catch {
        return false;
      }
    },

    async jwt({ token, user, account, profile }) {
      if (account) {
        const identity = identityFromCallback(
          account,
          user ?? {},
          profile,
        );

        if (!identity) {
          throw new Error("Invalid sign-in identity.");
        }

        token.id = await resolveCanonicalUserId(identity);
        token.authProvider = identity.provider;
        token.externalSubject = identity.subject;
        token.emailVerified = identity.emailVerified;
      }

      return token;
    },

    async session({ session, token }) {
      if (
        !session.user ||
        !isCanonicalUserId(token.id) ||
        (token.authProvider !== "credentials" &&
          token.authProvider !== "google") ||
        typeof token.externalSubject !== "string" ||
        typeof token.emailVerified !== "boolean"
      ) {
        return session;
      }

      const sessionUser = session.user as {
        id?: string;
        authProvider?: string;
        externalSubject?: string;
        emailVerified?: boolean;
      };

      sessionUser.id = token.id;
      sessionUser.authProvider = token.authProvider;
      sessionUser.externalSubject = token.externalSubject;
      sessionUser.emailVerified = token.emailVerified;

      return session;
    },
  },
};
