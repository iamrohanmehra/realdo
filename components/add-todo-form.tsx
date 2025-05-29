"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddTodoFormProps {
  onAdd: (title: string, description: string) => Promise<void>;
  userEmail: string;
}

export function AddTodoForm({ onAdd, userEmail }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      await onAdd(title.trim(), description.trim());
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to add todo:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className={undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Add New Todo - {userEmail}</CardTitle>
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
