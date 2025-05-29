"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { AUTHORIZED_USERS, getUserDisplayName } from "@/lib/user-mapping";

interface AddTodoFormProps {
  onAdd: (
    title: string,
    description: string,
    assignedToEmail: string
  ) => Promise<void>;
  currentUserEmail: string;
}

export function AddTodoForm({ onAdd, currentUserEmail }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>(currentUserEmail);
  const [isAdding, setIsAdding] = useState(false);

  const currentUserName = getUserDisplayName(currentUserEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      await onAdd(title.trim(), description.trim(), assignedTo);
      setTitle("");
      setDescription("");
      setAssignedTo(currentUserEmail);
    } catch (error) {
      console.error("Failed to add todo:", error);
      alert(
        "Failed to add todo: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsAdding(false);
    }
  };

  const getAssigneeDisplayText = () => {
    const assigneeName = getUserDisplayName(assignedTo);
    return assignedTo === currentUserEmail
      ? `Myself (${assigneeName})`
      : assigneeName;
  };

  return (
    <Card className={undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Add New Todo</CardTitle>
      </CardHeader>
      <CardContent className={undefined}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            disabled={isAdding}
            className={undefined}
            type={undefined}
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="min-h-[60px] resize-none"
            disabled={isAdding}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to:</label>
            <Select
              value={assignedTo}
              onValueChange={setAssignedTo}
              disabled={isAdding}
            >
              <SelectTrigger className={undefined}>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent className={undefined}>
                {AUTHORIZED_USERS.map((email) => (
                  <SelectItem key={email} value={email} className={undefined}>
                    {email === currentUserEmail
                      ? `Myself (${getUserDisplayName(email)})`
                      : getUserDisplayName(email)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            Will assign to: <strong>{getAssigneeDisplayText()}</strong>
          </div>

          <Button
            type="submit"
            disabled={!title.trim() || isAdding}
            className="w-full"
            variant={undefined}
            size={undefined}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAdding ? "Adding..." : "Add Todo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
