import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
    "https://hdkdxtotusteqqbvhloi.supabase.co",
    "sb_publishable_9pKEOQ3uBNK-XK4dxk8SlA_1RQrROSj",
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            storageKey: "specforma-admin-auth"
        }
    }
);
