export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_by: string;
  assigned_to: string;
  assigned_to_email: string; // Added this field
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}
