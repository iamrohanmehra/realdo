// lib/cleanup.ts
import { createClient } from "@/lib/supabase/client";
import { isOlderThanDays } from "@/lib/date-utils";

export async function cleanupOldCompletedTasks() {
  const supabase = createClient();

  try {
    // Calculate the cutoff date (7 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const { data, error } = await supabase
      .from("todos")
      .delete()
      .eq("completed", true)
      .lt("completed_at", cutoffDate.toISOString())
      .select();

    if (error) {
      console.error("Error cleaning up old completed tasks:", error);
      throw error;
    }

    console.log(`Cleaned up ${data?.length || 0} old completed tasks`);
    return data || [];
  } catch (err) {
    console.error("Cleanup failed:", err);
    throw err;
  }
}
