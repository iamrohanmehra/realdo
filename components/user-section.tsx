"use client";

import { Todo, User } from "@/types/todo";
import { AddTodoForm } from "./add-todo-form";
import { TodoItem } from "./todo-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserDisplayName } from "@/lib/user-mapping";

interface UserSectionProps {
  userEmail: string;
  todos: Todo[];
  currentUser: User;
  onAddTodo: (
    title: string,
    description: string,
    assignedToEmail: string
  ) => Promise<void>;
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
  // Show todos assigned to this user (by email)
  const userTodos = todos.filter(
    (todo) => todo.assigned_to_email === userEmail
  );
  const completedCount = userTodos.filter((todo) => todo.completed).length;
  const totalCount = userTodos.length;

  const userName = getUserDisplayName(userEmail);

  return (
    <div className="h-full flex flex-col">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {isCurrentUser
                ? `Your Todos (${userName})`
                : `${userName}'s Todos`}
            </CardTitle>
            <Badge variant="secondary" className={undefined}>
              {completedCount}/{totalCount} completed
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {isCurrentUser && (
        <div className="mb-4">
          <AddTodoForm onAdd={onAddTodo} currentUserEmail={currentUser.email} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {userTodos.length === 0 ? (
            <Card className={undefined}>
              <CardContent className="p-8 text-center text-gray-500">
                {isCurrentUser
                  ? "No todos assigned to you yet."
                  : `No todos assigned to ${userName} yet.`}
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
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
