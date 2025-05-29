// hooks/use-todos.ts
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
    updates: Partial<
      Pick<Todo, "title" | "description" | "completed" | "completed_at">
    >
  ) => {
    try {
      // If marking as completed, add completed_at timestamp
      const updateData = { ...updates };
      if (updates.completed === true) {
        updateData.completed_at = new Date().toISOString();
      } else if (updates.completed === false) {
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from("todos")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
      throw err;
    }
  };

  return {
    todos: filteredTodos, // Return filtered todos
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
  };
}
