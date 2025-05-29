"use client";

import { Todo, User } from "@/types/todo";
import { AddTodoForm } from "./add-todo-form";
import { TodoItem } from "./todo-item";
import { Badge } from "@/components/ui/badge";
import { getUserDisplayName } from "@/lib/user-mapping";
import { User as UserIcon, ListTodo } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";

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
  const userTodos = todos.filter(
    (todo) => todo.assigned_to_email === userEmail
  );
  const completedCount = userTodos.filter((todo) => todo.completed).length;
  const totalCount = userTodos.length;
  const userName = getUserDisplayName(userEmail);
  const progressValue =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Scroll fade effect state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 10; // Minimum scroll distance to show fade

    // Show top fade when scrolled down
    setShowTopFade(scrollTop > threshold);

    // Show bottom fade when not at bottom
    setShowBottomFade(scrollTop < scrollHeight - clientHeight - threshold);
  };

  // Check initial scroll state and set up scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    handleScroll();

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [userTodos.length]); // Re-run when todos change

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-6 pb-0 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <UserIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {isCurrentUser ? "Your Tasks" : `${userName}'s Tasks`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {totalCount === 0
                ? "No tasks yet"
                : `${completedCount} of ${totalCount} completed`}
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <Badge variant="secondary" className={undefined}>
                {Math.round(progressValue)}%
              </Badge>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        )}
      </div>

      {/* Fixed Add Todo Form Section */}
      {isCurrentUser && (
        <div className="flex-shrink-0 p-6 pb-0">
          <AddTodoForm onAdd={onAddTodo} currentUserEmail={currentUser.email} />
        </div>
      )}

      {/* Scrollable Todo List Section with Fade Overlays */}
      <div className="flex-1 relative overflow-hidden">
        {/* Top Fade Overlay */}
        <div
          className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            showTopFade ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Bottom Fade Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            showBottomFade ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto scrollbar-hidden"
        >
          <div className="p-6 space-y-3">
            {userTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <ListTodo className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No tasks yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isCurrentUser
                    ? "Create your first task to get started."
                    : `${userName} hasn't been assigned any tasks yet.`}
                </p>
              </div>
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
            {/* Bottom padding for better scrolling experience */}
            <div className="h-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
