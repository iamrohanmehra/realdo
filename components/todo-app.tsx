"use client";

import { useAuth } from "@/hooks/use-auth";
import { useTodos } from "@/hooks/use-todos";
import { UserSection } from "./user-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { LogOut, Users, CheckSquare, Monitor } from "lucide-react";
import { AUTHORIZED_USERS, getUserDisplayName } from "@/lib/user-mapping";
import { cleanupOldCompletedTasks } from "@/lib/cleanup";
import { useEffect, useState } from "react";

export function TodoApp() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const {
    todos,
    loading: todosLoading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
  } = useTodos();

  // State for mobile view user selection
  const [selectedUserView, setSelectedUserView] = useState<string>("");

  useEffect(() => {
    if (user) {
      cleanupOldCompletedTasks().catch(console.error);
      // Set default view to current user on mobile
      setSelectedUserView(user.email);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Todo Workspace</CardTitle>
              <p className="text-muted-foreground">
                Collaborative task management
              </p>
            </div>
          </CardHeader>
          <CardContent className={undefined}>
            <Button
              onClick={signInWithGoogle}
              className="w-full"
              size="lg"
              variant={undefined}
            >
              <Users className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!AUTHORIZED_USERS.includes(user.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This workspace is invite-only.
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Button
              onClick={signOut}
              variant="outline"
              className={undefined}
              size={undefined}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHimanshu = user.email === "rohanmehra224466@gmail.com";
  const isAshish = user.email === "ashish.efslon@gmail.com";
  const currentUserName = getUserDisplayName(user.email);

  const userEmails = ["ashish.efslon@gmail.com", "rohanmehra224466@gmail.com"];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <header className="border-b bg-background flex-shrink-0 z-10">
        <div className="w-full flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold">Todo Workspace</h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Mobile User Selector */}
            <div className="lg:hidden">
              <Select
                value={selectedUserView}
                onValueChange={setSelectedUserView}
              >
                <SelectTrigger className="w-[140px]">
                  <Monitor className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={undefined}>
                  {userEmails.map((email) => (
                    <SelectItem key={email} value={email} className={undefined}>
                      {email === user.email
                        ? `My Tasks`
                        : `${getUserDisplayName(email)}'s Tasks`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="text-sm text-muted-foreground hidden sm:block">
              {currentUserName}
            </span>
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className={undefined}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Fixed Error Display */}
      {error && (
        <div className="w-full px-4 pt-4 flex-shrink-0 z-10">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full px-4 py-6 overflow-hidden">
        {/* Desktop Layout with Resizable Panels */}
        <div className="hidden lg:block h-full w-full">
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full w-full rounded-lg border"
          >
            {/* Ashish's Container */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full w-full overflow-hidden">
                <div className="h-full flex justify-center">
                  <div className="w-full max-w-2xl h-full overflow-hidden">
                    <UserSection
                      userEmail="ashish.efslon@gmail.com"
                      todos={todos}
                      currentUser={user}
                      onAddTodo={addTodo}
                      onUpdateTodo={updateTodo}
                      onDeleteTodo={deleteTodo}
                      isCurrentUser={isAshish}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className={undefined} />

            {/* Himanshu's Container */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full w-full overflow-hidden">
                <div className="h-full flex justify-center">
                  <div className="w-full max-w-2xl h-full overflow-hidden">
                    <UserSection
                      userEmail="rohanmehra224466@gmail.com"
                      todos={todos}
                      currentUser={user}
                      onAddTodo={addTodo}
                      onUpdateTodo={updateTodo}
                      onDeleteTodo={deleteTodo}
                      isCurrentUser={isHimanshu}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile Layout - Single Container */}
        <div className="lg:hidden h-full w-full">
          <div className="h-full w-full rounded-lg border overflow-hidden">
            <div className="mx-auto max-w-2xl h-full overflow-hidden">
              <UserSection
                userEmail={selectedUserView}
                todos={todos}
                currentUser={user}
                onAddTodo={addTodo}
                onUpdateTodo={updateTodo}
                onDeleteTodo={deleteTodo}
                isCurrentUser={selectedUserView === user.email}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="border-t bg-background flex-shrink-0 z-10">
        <div className="w-full px-4 py-3">
          <p className="text-center text-sm text-muted-foreground">
            Built with Next.js, Supabase & shadcn/ui • Collaborative Todo
            Workspace
          </p>
        </div>
      </footer>

      {todosLoading && (
        <div className="fixed bottom-16 right-4 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground shadow-md z-20">
          Syncing...
        </div>
      )}
    </div>
  );
}
