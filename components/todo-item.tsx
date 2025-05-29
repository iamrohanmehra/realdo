"use client";

import { useState } from "react";
import { Todo, User } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit2, Trash2, Save, X, Clock } from "lucide-react";
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

  const canEdit = currentUser.email === todo.assigned_to_email;

  const handleToggleComplete = async () => {
    if (!canEdit) return;
    setIsUpdating(true);
    try {
      await onUpdate(todo.id, { completed: !todo.completed });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setIsUpdating(true);
    try {
      await onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!canEdit) return;
    if (confirm("Are you sure you want to delete this task?")) {
      await onDelete(todo.id);
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

  return (
    <TooltipProvider>
      <Card
        className={`transition-all duration-200 group ${
          todo.completed ? "bg-muted/50" : "hover:shadow-md"
        }`}
      >
        <CardContent className="p-4">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isUpdating}
                placeholder="Task title"
                className={undefined}
                type={undefined}
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a description"
                className="min-h-[80px] resize-none"
                disabled={isUpdating}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  disabled={!editTitle.trim() || isUpdating}
                  size="sm"
                  className={undefined}
                  variant={undefined}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  variant="outline"
                  size="sm"
                  className={undefined}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={handleToggleComplete}
                  disabled={!canEdit || isUpdating}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-medium leading-tight ${
                      todo.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {todo.title}
                  </h3>
                  {todo.description && (
                    <p
                      className={`text-sm mt-1 ${
                        todo.completed
                          ? "text-muted-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {todo.description}
                    </p>
                  )}
                </div>
                {canEdit && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className={undefined}>
                        <p>Edit task</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleDelete}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className={undefined}>
                        <p>Delete task</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-start text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(todo.created_at)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
