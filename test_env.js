const { loadEnvConfig } = require('@next/env');
const { combinedEnv } = loadEnvConfig(process.cwd());
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!combinedEnv.SUPABASE_SERVICE_ROLE_KEY);
console.log('SUPABASE_SERVICE_ROLE_KEY length:', combinedEnv.SUPABASE_SERVICE_ROLE_KEY?.length);
console.log('NEXT_PUBLIC_SUPABASE_URL:', combinedEnv.NEXT_PUBLIC_SUPABASE_URL);
