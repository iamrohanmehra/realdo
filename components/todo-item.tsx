"use client";

import { useState } from "react";
import { Todo, User } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit2, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { getUserDisplayName } from "@/lib/user-mapping";
import { toast } from "sonner";
import { EditTaskDialog } from "./edit-task-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";

interface TodoItemProps {
  todo: Todo;
  currentUser: User;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Todo, "title" | "description" | "completed">>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoItem({
  todo,
  currentUser,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Permission logic:
  const isAssignedToCurrentUser = currentUser.email === todo.assigned_to_email;
  const isCreatedByCurrentUser = currentUser.id === todo.created_by;
  const isAssignedToSelf = isCreatedByCurrentUser && isAssignedToCurrentUser;

  // Can edit/delete ONLY if:
  // 1. You created the task (regardless of who it's assigned to)
  // Note: If someone else assigned it to you, you can't edit/delete
  const canEdit = isCreatedByCurrentUser;
  const canDelete = isCreatedByCurrentUser;

  // Can mark complete ONLY if the task is assigned to you
  const canToggleComplete = isAssignedToCurrentUser;

  const assignedUserName = getUserDisplayName(todo.assigned_to_email);

  const handleToggleComplete = async () => {
    if (!canToggleComplete) {
      toast.error(
        "You can only mark tasks complete if they're assigned to you"
      );
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(todo.id, { completed: !todo.completed });
      toast.success(
        todo.completed
          ? "Task marked as incomplete"
          : "Task marked as completed"
      );
    } catch (error) {
      console.error("Toggle complete error:", error);
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine the task relationship for display
  const getTaskRelationship = () => {
    if (isAssignedToSelf) {
      return "self"; // You assigned it to yourself
    } else if (isCreatedByCurrentUser) {
      return "created"; // You created it and assigned to someone else
    } else if (isAssignedToCurrentUser) {
      return "assigned"; // Someone else assigned it to you
    }
    return "other"; // Shouldn't happen in normal flow
  };

  const taskRelationship = getTaskRelationship();

  return (
    <TooltipProvider>
      <Card
        className={`transition-all duration-200 ${
          todo.completed
            ? "bg-muted/50 border-muted-foreground/20"
            : "bg-card hover:shadow-sm border-border hover:border-muted-foreground/30"
        }`}
      >
        <CardContent className="p-2.5">
          <div className="flex items-start gap-2.5">
            <div className="relative">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={handleToggleComplete}
                disabled={!canToggleComplete || isUpdating}
                className="mt-0.5"
              />
              {/* Show tooltip when checkbox is disabled */}
              {!canToggleComplete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute inset-0 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className={undefined}>
                    <p>Only the assignee can mark this as completed</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={`font-medium text-sm leading-snug ${
                    todo.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {todo.title}
                </h3>

                {/* Show edit/delete buttons only for tasks you created */}
                {(canEdit || canDelete) && (
                  <div className="flex gap-0.5 flex-shrink-0">
                    {canEdit && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => setIsEditDialogOpen(true)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className={undefined}>
                          <p>Edit task</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {canDelete && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => setIsDeleteDialogOpen(true)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className={undefined}>
                          <p>Delete task</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>

              {todo.description && (
                <p
                  className={`text-xs leading-relaxed ${
                    todo.completed
                      ? "text-muted-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {todo.description}
                </p>
              )}

              <div className="flex items-center justify-end pt-1">
                {/* <div className="flex items-center gap-1.5"> */}
                {/* Show different badges based on task relationship */}
                {/* {taskRelationship === "assigned" && (
                    <Badge
                      variant="secondary"
                      className="text-xs h-4 px-1.5 py-0"
                    >
                      Assigned to you
                    </Badge>
                  )}

                  {taskRelationship === "created" && (
                    <Badge
                      variant="outline"
                      className="text-xs h-4 px-1.5 py-0"
                    >
                      Assigned to {assignedUserName}
                    </Badge>
                  )}

                  {todo.completed && (
                    <Badge
                      variant="default"
                      className="text-xs h-4 px-1.5 py-0 bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div> */}

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" />
                  <span className="text-xs">{formatDate(todo.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog - Only show for tasks you created */}
      {canEdit && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          todo={todo}
          onUpdate={onUpdate}
        />
      )}

      {/* Delete Dialog - Only show for tasks you created */}
      {canDelete && (
        <DeleteTaskDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          todo={todo}
          onDelete={onDelete}
        />
      )}
    </TooltipProvider>
  );
}
