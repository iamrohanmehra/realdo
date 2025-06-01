// components/edit-task-dialog.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, User } from "lucide-react";
import { Todo } from "@/types/todo";
import { toast } from "sonner";
import { AUTHORIZED_USERS, getUserDisplayName } from "@/lib/user-mapping";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo: Todo;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Todo, "title" | "description" | "completed">>
  ) => Promise<void>;
  canEditAssignment?: boolean;
}

export function EditTaskDialog({
  open,
  onOpenChange,
  todo,
  onUpdate,
  canEditAssignment = false,
}: EditTaskDialogProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [assignedTo, setAssignedTo] = useState(todo.assigned_to_email);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUpdating(true);
    try {
      const updates: any = {
        title: title.trim(),
        description: description.trim(),
      };

      // Only include assignment change if user has permission and assignment actually changed
      if (canEditAssignment && assignedTo !== todo.assigned_to_email) {
        updates.assigned_to_email = assignedTo;
      }

      await onUpdate(todo.id, updates);
      toast.success("Task updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setDescription(todo.description || "");
    setAssignedTo(todo.assigned_to_email);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader className={undefined}>
          <DialogTitle className={undefined}>Edit Task</DialogTitle>
          <DialogDescription className={undefined}>
            Make changes to your task here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title" className="text-sm font-medium">
              Task Title
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              disabled={isUpdating}
              autoFocus
              className={undefined}
              type={undefined}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              className="min-h-[70px] resize-none"
              disabled={isUpdating}
            />
          </div>

          {canEditAssignment && (
            <div className="space-y-1.5">
              <Label htmlFor="edit-assignee" className="text-sm font-medium">
                Assigned To
              </Label>
              <Select
                value={assignedTo}
                onValueChange={setAssignedTo}
                disabled={isUpdating}
              >
                <SelectTrigger className={undefined}>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent className={undefined}>
                  {AUTHORIZED_USERS.map((email) => (
                    <SelectItem key={email} value={email} className={undefined}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {getUserDisplayName(email)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {assignedTo !== todo.assigned_to_email && (
                <p className="text-xs text-muted-foreground">
                  Task will be reassigned to {getUserDisplayName(assignedTo)}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex-1"
              size={undefined}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isUpdating}
              className="flex-1"
              variant={undefined}
              size={undefined}
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
