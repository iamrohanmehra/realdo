// types/todo.ts
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_email: string;
  assigned_to: string;
  assigned_to_email: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}
