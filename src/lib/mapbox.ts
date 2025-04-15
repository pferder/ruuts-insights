import { supabase } from "@/lib/supabase";

export async function getMapboxToken(): Promise<string | null> {
  try {
    const { data, error } = await supabase.from("secrets").select("value").eq("key", "mapbox_token").single();

    if (error) {
      console.error("Error fetching Mapbox token:", error);
      return null;
    }

    return data?.value || null;
  } catch (error) {
    console.error("Error fetching Mapbox token:", error);
    return null;
  }
}
