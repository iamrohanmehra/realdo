"use client";

import { useState } from "react";
import { Todo, User } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserDisplayName } from "@/lib/user-mapping";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const isCreatedByMe = todo.created_by === currentUser.id;
  const isAssignedToMe = todo.assigned_to_email === currentUser.email;
  const canMarkComplete = isAssignedToMe; // Only assigned user can mark as complete

  // New permission logic: can only edit/delete if created by me AND assigned to me
  // OR if created by me (my own tasks)
  // Cannot edit/delete tasks assigned to me by others
  const canEditOrDelete = isCreatedByMe && (isAssignedToMe || !isAssignedToMe);

  // More specific: if someone else created it and assigned it to me, I can only mark complete
  const isAssignedByOther = !isCreatedByMe && isAssignedToMe;
  const canOnlyMarkComplete = isAssignedByOther;

  const creatorName = getUserDisplayName(
    // We need to get creator email from the user ID - for now using a simple approach
    isCreatedByMe ? currentUser.email : "other@email.com"
  );

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    setIsUpdating(true);
    try {
      await onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setIsEditing(false);
  };

  const handleToggleComplete = async () => {
    if (!canMarkComplete) return;

    setIsUpdating(true);
    try {
      await onUpdate(todo.id, { completed: !todo.completed });
    } catch (error) {
      console.error("Failed to toggle completion:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      try {
        await onDelete(todo.id);
      } catch (error) {
        console.error("Failed to delete todo:", error);
      }
    }
  };

  const getAssignedByText = () => {
    if (isCreatedByMe) {
      return isAssignedToMe ? "Created by you" : `Assigned by you`;
    } else {
      // Get the creator's name - we'll need to improve this
      const creatorEmail = todo.created_by; // This is actually the user ID
      // For now, determine based on current user
      const otherUserEmail =
        currentUser.email === "rohanmehra224466@gmail.com"
          ? "ashish.efslon@gmail.com"
          : "rohanmehra224466@gmail.com";
      const otherUserName = getUserDisplayName(otherUserEmail);
      return `Assigned by ${otherUserName}`;
    }
  };

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "transition-all duration-200",
          todo.completed && "opacity-60",
          isAssignedToMe
            ? "border-blue-200 bg-blue-50/30"
            : "border-green-200 bg-green-50/30"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={handleToggleComplete}
                    disabled={!canMarkComplete || isUpdating}
                    className={cn(
                      !canMarkComplete && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>
              </TooltipTrigger>
              {!canMarkComplete && (
                <TooltipContent className={undefined}>
                  <p>Only assignee can mark complete</p>
                </TooltipContent>
              )}
            </Tooltip>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Todo title..."
                    className="font-medium"
                    type={undefined}
                  />
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description (optional)..."
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!editTitle.trim() || isUpdating}
                      className={undefined}
                      variant={undefined}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className={undefined}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3
                    className={cn(
                      "font-medium text-sm",
                      todo.completed && "line-through text-gray-500"
                    )}
                  >
                    {todo.title}
                  </h3>

                  {todo.description && (
                    <p
                      className={cn(
                        "text-xs text-gray-600 mt-1",
                        todo.completed && "line-through"
                      )}
                    >
                      {todo.description}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {getAssignedByText()}
                  </p>

                  {canOnlyMarkComplete && (
                    <p className="text-xs text-blue-600 mt-1">
                      You can only mark this task as complete
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isEditing && !canOnlyMarkComplete && canEditOrDelete && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  disabled={isUpdating}
                  className={undefined}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isUpdating}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
