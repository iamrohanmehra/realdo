"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Todo } from "@/types/todo";
import { RealtimeChannel } from "@supabase/supabase-js";
import { shouldShowCompletedTask } from "@/lib/date-utils";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Filter todos to hide completed tasks from previous days
  const filteredTodos = todos.filter((todo) => {
    if (!todo.completed) return true;
    return shouldShowCompletedTask(todo.completed_at || null);
  });

  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchTodos = async () => {
      try {
        const { data, error } = await supabase
          .from("todos")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTodos(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch todos");
      } finally {
        setLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel("todos-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "todos",
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setTodos((current) => [payload.new as Todo, ...current]);
            } else if (payload.eventType === "UPDATE") {
              setTodos((current) =>
                current.map((todo) =>
                  todo.id === payload.new.id ? (payload.new as Todo) : todo
                )
              );
            } else if (payload.eventType === "DELETE") {
              setTodos((current) =>
                current.filter((todo) => todo.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();
    };

    fetchTodos();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  const addTodo = async (
    title: string,
    description: string = "",
    assignedToEmail: string
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("todos")
        .insert({
          title,
          description,
          created_by: user.id,
          assigned_to: user.id,
          assigned_to_email: assignedToEmail,
        })
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
    } catch (err) {
      console.error("Add todo error:", err);
      setError(err instanceof Error ? err.message : "Failed to add todo");
      throw err;
    }
  };

  const updateTodo = async (
    id: string,
    updates: Partial<Pick<Todo, "title" | "description" | "completed">> & {
      assigned_to_email?: string;
    }
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // If assignment is being changed, we need to update both assigned_to and assigned_to_email
      if (updates.assigned_to_email) {
        // For now, we'll just update the email. You might need to implement
        // a user lookup if you need the assigned_to UUID as well
        updateData.assigned_to_email = updates.assigned_to_email;
      }

      // If marking as completed, set completed_at
      if (
        updates.completed === true &&
        !todos.find((t) => t.id === id)?.completed
      ) {
        updateData.completed_at = new Date().toISOString();
      } else if (updates.completed === false) {
        updateData.completed_at = null;
      }

      // Fix: Use 'todos' table instead of 'tasks'
      const { error } = await supabase
        .from("todos")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      // Update local state
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, ...updateData } : todo))
      );
    } catch (error) {
      console.error("Error updating todo:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update todo"
      );
      throw error;
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }
    } catch (err) {
      console.error("Delete todo error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete todo");
      throw err;
    }
  };

  return {
    todos: filteredTodos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
  };
}
