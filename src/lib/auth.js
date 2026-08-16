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

// Global in-memory cache for user ban & session status to prevent overloading Supabase DB
const banCache = new Map();
const userValidationCache = new Map();
const VALIDATION_TTL_MS = 30 * 1000; // 30 seconds cache TTL

async function refreshAccessToken(token) {
  try {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient.auth.refreshSession({
      refresh_token: token.refreshToken,
    });

    if (error || !data?.session) {
      console.error("Error refreshing Supabase access token:", error?.message);
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }

    return {
      ...token,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token ?? token.refreshToken,
      accessTokenExpires: data.session.expires_at
        ? data.session.expires_at * 1000
        : Date.now() + 3600 * 1000,
      error: null,
    };
  } catch (err) {
    console.error("Exception during token refresh:", err);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

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

        // Generate unique session ID to enforce single active session per user
        const sessionId = crypto.randomUUID();

        // Perform session revocation & active session ID update concurrently
        const adminTasks = [];
        if (data.session?.access_token) {
          adminTasks.push(
            supabaseAdmin.auth.admin
              .signOut(data.session.access_token, "others")
              .catch((err) => console.warn("Supabase revoke notice:", err?.message))
          );
        }
        adminTasks.push(
          supabaseAdmin.auth.admin
            .updateUserById(data.user.id, {
              user_metadata: {
                ...(data.user.user_metadata || {}),
                active_session_id: sessionId,
              },
            })
            .catch((err) => console.error("Failed to set active session ID in Supabase:", err))
        );

        await Promise.all(adminTasks);

        // Clear cached validation entry for this user so current session updates immediately
        banCache.delete(data.user.id);
        userValidationCache.delete(data.user.id);

        return {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || "User",
          email: data.user.email,
          sessionId: sessionId,
          accessToken: data.session?.access_token,
          refreshToken: data.session?.refresh_token,
          accessTokenExpires: data.session?.expires_at
            ? data.session.expires_at * 1000
            : Date.now() + 3600 * 1000,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.sessionId = user.sessionId;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.error = null;
        return token;
      }

      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      // Return previous token if the access token has not expired yet (buffer 60 seconds)
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 60 * 1000
      ) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (!token || !token.id || token.error === "RefreshAccessTokenError") {
        return { ...session, user: null, error: token?.error || "InvalidToken" };
      }

      const userId = token.id;
      const now = Date.now();
      let cached = userValidationCache.get(userId);

      if (!cached || now - cached.timestamp > VALIDATION_TTL_MS) {
        let isBanned = false;
        let activeSessionId = null;

        try {
          const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

          isBanned =
            error ||
            !data?.user ||
            (data.user.banned_until && new Date(data.user.banned_until) > new Date());
          activeSessionId = data?.user?.user_metadata?.active_session_id || null;
        } catch (err) {
          console.error("Supabase live session validation failed:", err);
        }

        cached = { isBanned, activeSessionId, timestamp: now };
        userValidationCache.set(userId, cached);
      }

      if (cached.isBanned) {
        console.warn(`Active ban detected for user ${userId}. Terminating session.`);
        userValidationCache.delete(userId);
        return { ...session, user: null, error: "UserBanned" };
      }

      // Enforce single session per user: if user signed in elsewhere, invalidate old session immediately
      if (token.sessionId && cached.activeSessionId && token.sessionId !== cached.activeSessionId) {
        console.warn(`Session overridden by newer login for user ${userId}.`);
        userValidationCache.delete(userId);
        return { ...session, user: null, error: "SessionTerminated" };
      }

      if (session.user) {
        session.user.id = token.id;
      }
      session.accessToken = token.accessToken;
      session.error = token.error;
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

