import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const isProduction = process.env.NODE_ENV === "production";

// Separate anon client ONLY for sign-in password verification.
// The service role client must NEVER call signInWithPassword — it
// causes Supabase to log 400 warnings and creates ghost auth sessions.
const getAnonClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );

// Global in-memory cache for user ban status to prevent overloading Supabase DB
const banCache = new Map();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Use the anon client for password verification — NOT the service role client.
        // Service role + signInWithPassword causes 400 warnings in Supabase logs
        // and creates phantom auth sessions that don't appear in the dashboard.
        const anonClient = getAnonClient();
        const { data, error } = await anonClient.auth.signInWithPassword({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        });

        if (error || !data.user) {
          console.error("Supabase Auth Error:", error?.message);
          return null;
        }

        return {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || "User",
          email: data.user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token || !token.id) {
        return null; // Invalidate session
      }

      const userId = token.id;
      const now = Date.now();
      const cached = banCache.get(userId);

      // Check status every 10 seconds
      const CACHE_TTL = 10 * 1000;
      let isBanned = false;

      if (cached && now - cached.lastChecked < CACHE_TTL) {
        isBanned = cached.isBanned;
      } else {
        try {
          const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

          isBanned =
            error ||
            !data?.user ||
            (data.user.banned_until && new Date(data.user.banned_until) > new Date());

          banCache.set(userId, {
            isBanned,
            lastChecked: now,
          });
        } catch (err) {
          console.error("Supabase live ban check failed:", err);
          // Fallback to previous cached value if network fails
          isBanned = cached ? cached.isBanned : false;
        }
      }

      if (isBanned) {
        console.warn(`Active ban detected for user ${userId}. Terminating session.`);
        return null; // Force invalidate session
      }

      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,

  trustHost: true,

  pages: {
    signIn: "/sign-up",
  },

  useSecureCookies: isProduction,
  cookies: {
    sessionToken: {
      name: isProduction
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
};
