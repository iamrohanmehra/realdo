"use client";

import { Todo, User } from "@/types/todo";
import { AddTodoForm } from "./add-todo-form";
import { TodoItem } from "./todo-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserSectionProps {
  userEmail: string;
  todos: Todo[];
  currentUser: User;
  onAddTodo: (title: string, description: string) => Promise<void>;
  onUpdateTodo: (
    id: string,
    updates: Partial<Pick<Todo, "title" | "description" | "completed">>
  ) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  isCurrentUser: boolean;
}

export function UserSection({
  userEmail,
  todos,
  currentUser,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  isCurrentUser,
}: UserSectionProps) {
  // Filter todos by the user's email (since we're using email to identify users)
  const userTodos = todos.filter((todo) => {
    // For current user, show todos they created
    if (isCurrentUser) {
      return todo.created_by === currentUser.id;
    }
    // For other user, we need to identify them by email
    // Since we don't have a users table, we'll show all todos not created by current user
    return todo.created_by !== currentUser.id;
  });

  const completedCount = userTodos.filter((todo) => todo.completed).length;
  const totalCount = userTodos.length;

  return (
    <div className="h-full flex flex-col">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {isCurrentUser ? "Your Todos" : `${userEmail}'s Todos`}
            </CardTitle>
            <Badge variant="secondary" className={undefined}>
              {completedCount}/{totalCount} completed
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {isCurrentUser && (
        <div className="mb-4">
          <AddTodoForm onAdd={onAddTodo} userEmail={userEmail} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {userTodos.length === 0 ? (
            <Card className={undefined}>
              <CardContent className="p-8 text-center text-gray-500">
                {isCurrentUser
                  ? "No todos yet. Add one above!"
                  : "No todos yet."}
              </CardContent>
            </Card>
          ) : (
            userTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                currentUser={currentUser}
                onUpdate={onUpdateTodo}
                onDelete={onDeleteTodo}
                userEmail={isCurrentUser ? currentUser.email : userEmail}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
