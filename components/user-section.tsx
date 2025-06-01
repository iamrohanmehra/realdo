"use client";

import { Todo, User } from "@/types/todo";
import { TodoItem } from "./todo-item";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getUserDisplayName } from "@/lib/user-mapping";
import { User as UserIcon, ListTodo, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";

interface UserSectionProps {
  userEmail: string;
  todos: Todo[];
  currentUser: User;
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
    const threshold = 10;

    setShowTopFade(scrollTop > threshold);
    setShowBottomFade(scrollTop < scrollHeight - clientHeight - threshold);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [userTodos.length]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-3 space-y-2.5 border-b bg-card/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border">
            <UserIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold tracking-tight leading-tight">
              {isCurrentUser ? "Your Tasks" : `${userName}'s Tasks`}
            </h2>
            <p className="text-xs text-muted-foreground">
              {totalCount === 0
                ? "No tasks assigned"
                : `${totalCount} task${totalCount !== 1 ? "s" : ""} total`}
            </p>
          </div>
          {totalCount > 0 && (
            <Badge variant="outline" className="font-mono text-xs h-5 px-2">
              {completedCount}/{totalCount}
            </Badge>
          )}
        </div>

        {totalCount > 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-2.5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">Progress</span>
                  </div>
                  <Badge
                    variant={progressValue === 100 ? "default" : "secondary"}
                    className="font-mono text-xs h-4 px-1.5"
                  >
                    {Math.round(progressValue)}%
                  </Badge>
                </div>
                <Progress value={progressValue} className="h-1.5" />
                {progressValue === 100 && (
                  <p className="text-xs text-green-600 font-medium pt-0.5">
                    🎉 All tasks completed!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scrollable Todo List Section */}
      <div className="flex-1 relative overflow-hidden">
        {/* Fade Overlays */}
        <div
          className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            showTopFade ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            showBottomFade ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Scrollable Content */}
        <div ref={scrollContainerRef} className="h-full overflow-y-auto">
          <div className="p-3 space-y-2">
            {userTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted border-2 border-dashed border-muted-foreground/25">
                  <ListTodo className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-base font-semibold">No tasks yet</h3>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
                  {isCurrentUser
                    ? "Click the + button to create your first task and get started."
                    : `${userName} hasn't been assigned any tasks yet. Use the + button to assign them a task.`}
                </p>
              </div>
            ) : (
              <>
                {/* Active Tasks */}
                {userTodos
                  .filter((todo) => !todo.completed)
                  .map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      currentUser={currentUser}
                      onUpdate={onUpdateTodo}
                      onDelete={onDeleteTodo}
                    />
                  ))}

                {/* Completed Tasks */}
                {userTodos.filter((todo) => todo.completed).length > 0 && (
                  <>
                    <div className="flex items-center gap-2 py-1.5">
                      <div className="h-px bg-border flex-1" />
                      <span className="text-xs text-muted-foreground bg-background px-2">
                        Completed (
                        {userTodos.filter((todo) => todo.completed).length})
                      </span>
                      <div className="h-px bg-border flex-1" />
                    </div>

                    {userTodos
                      .filter((todo) => todo.completed)
                      .map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          currentUser={currentUser}
                          onUpdate={onUpdateTodo}
                          onDelete={onDeleteTodo}
                        />
                      ))}
                  </>
                )}
              </>
            )}
            {/* Bottom padding */}
            <div className="h-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
