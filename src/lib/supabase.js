import { createClient } from "@supabase/supabase-js";

let clientInstance = null;

const getClient = () => {
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!clientInstance || (!clientInstance._hasKey && hasKey)) {
    console.log("LAZILY INITIALIZING SUPABASE CLIENT:", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyExists: hasKey,
      keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    });
    clientInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
    clientInstance._hasKey = hasKey;
  }
  return clientInstance;
};

export const supabaseAdmin = new Proxy({}, {
  get(target, prop) {
    const client = getClient();
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});
