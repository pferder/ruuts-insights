import { createClient } from "@supabase/supabase-js";

// Verificar que las variables de entorno estén definidas
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error("VITE_SUPABASE_URL is not defined in environment variables");
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not defined in environment variables");
}

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export const getMapboxToken = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.from("secrets").select("value").eq("key", "mapbox_token").single();

    if (error) {
      console.error("Error fetching Mapbox token from Supabase:", error);
      throw new Error("Failed to fetch Mapbox token from Supabase");
    }

    if (!data?.value) {
      throw new Error("Mapbox token not found in Supabase secrets");
    }

    return data.value;
  } catch (error) {
    console.error("Error in getMapboxToken:", error);
    throw error;
  }
};
