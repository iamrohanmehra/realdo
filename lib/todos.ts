import { createClient } from "@/lib/supabase/client";

export async function updateTodoCompletion(
  todoId: string,
  completed: boolean,
  currentUserId: string,
  todoCreatedBy: string
) {
  // Check if user is trying to mark someone else's todo as complete
  if (completed && currentUserId !== todoCreatedBy) {
    throw new Error("You can only mark your own todos as completed");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", todoId)
    .select();

  if (error) throw error;
  return data;
}

export async function updateTodoContent(
  todoId: string,
  updates: { title?: string; description?: string }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("todos")
    .update(updates)
    .eq("id", todoId)
    .select();

  if (error) throw error;
  return data;
}
