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
import { Plus, User, X } from "lucide-react";
import { AUTHORIZED_USERS, getUserDisplayName } from "@/lib/user-mapping";
import { toast } from "sonner";

interface AddTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (
    title: string,
    description: string,
    assignedToEmail: string
  ) => Promise<void>;
  currentUserEmail: string;
}

export function AddTodoDialog({
  open,
  onOpenChange,
  onAdd,
  currentUserEmail,
}: AddTodoDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(currentUserEmail);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      await onAdd(title.trim(), description.trim(), assignedTo);

      const assigneeName = getUserDisplayName(assignedTo);
      const message =
        assignedTo === currentUserEmail
          ? "New task added successfully"
          : `Task assigned to ${assigneeName}`;
      toast.success(message);

      setTitle("");
      setDescription("");
      setAssignedTo(currentUserEmail);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add todo:", error);
      toast.error(
        "Failed to add task: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-sm">
            Add a new task to your workspace. You can assign it to yourself or a
            team member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium">
              Task Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              disabled={isAdding}
              autoFocus
              className="focus:ring-2 focus:ring-primary/20"
              type={undefined}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              className="min-h-[70px] resize-none focus:ring-2 focus:ring-primary/20"
              disabled={isAdding}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assignee" className="text-sm font-medium">
              Assign To
            </Label>
            <Select
              value={assignedTo}
              onValueChange={setAssignedTo}
              disabled={isAdding}
            >
              <SelectTrigger className="focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent className={undefined}>
                {AUTHORIZED_USERS.map((email) => (
                  <SelectItem key={email} value={email} className={undefined}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {email === currentUserEmail
                        ? `Myself (${getUserDisplayName(email)})`
                        : getUserDisplayName(email)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
              className="flex-1"
              size={undefined}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isAdding}
              className="flex-1"
              variant={undefined}
              size={undefined}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
