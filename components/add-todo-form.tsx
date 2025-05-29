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

export function AddTodoForm({ onAdd, currentUserEmail }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(currentUserEmail);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
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

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add New Task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              disabled={isAdding}
              className={undefined}
              type={undefined}
            />
          </div>

          <div className="space-y-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              className="min-h-[80px] resize-none"
              disabled={isAdding}
            />
          </div>

          <div className="space-y-2">
            <Select
              value={assignedTo}
              onValueChange={setAssignedTo}
              disabled={isAdding}
            >
              <SelectTrigger className={undefined}>
                <SelectValue placeholder="Assign to" />
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

          <Button
            type="submit"
            disabled={!title.trim() || isAdding}
            className="w-full"
            variant={undefined}
            size={undefined}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAdding ? "Adding..." : "Add Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
