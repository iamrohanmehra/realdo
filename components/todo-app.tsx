"use client";

import { useAuth } from "@/hooks/use-auth";
import { useTodos } from "@/hooks/use-todos";
import { UserSection } from "./user-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Users } from "lucide-react";

const AUTHORIZED_USERS = [
  "rohanmehra224466@gmail.com",
  "ashish.efslon@gmail.com", // Fixed email
];

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Collaborative Todo App</CardTitle>
            <p className="text-gray-600">Sign in to get started</p>
          </CardHeader>
          <CardContent className={undefined}>
            <Button
              onClick={signInWithGoogle}
              className="w-full"
              variant={undefined}
              size={undefined}
            >
              <Users className="w-4 h-4 mr-2" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!AUTHORIZED_USERS.includes(user.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Sorry, this app is only available for authorized users.</p>
            <p className="text-sm text-gray-600">Your email: {user.email}</p>
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

  const isRohan = user.email === "rohanmehra224466@gmail.com";
  const isAshish = user.email === "ashish.efslon@gmail.com";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Collaborative Todo App
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className={undefined}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex h-[calc(100vh-73px)]">
        {/* Ashish's Section */}
        <div className="w-1/2 p-6 border-r border-gray-200">
          <UserSection
            userEmail="ashish.efslon@gmail.com" // Fixed email
            todos={todos}
            currentUser={user}
            onAddTodo={addTodo}
            onUpdateTodo={updateTodo}
            onDeleteTodo={deleteTodo}
            isCurrentUser={isAshish}
            userId={""}
            otherUserId={""}
          />
        </div>

        {/* Rohan's Section */}
        <div className="w-1/2 p-6">
          <UserSection
            userEmail="rohanmehra224466@gmail.com"
            todos={todos}
            currentUser={user}
            onAddTodo={addTodo}
            onUpdateTodo={updateTodo}
            onDeleteTodo={deleteTodo}
            isCurrentUser={isRohan}
            userId={""}
            otherUserId={""}
          />
        </div>
      </main>

      {todosLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Syncing...
        </div>
      )}

      {/* Debug Info */}
      <div className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded text-xs max-w-xs">
        <div>User: {user.email}</div>
        <div>User ID: {user.id}</div>
        <div>Todos: {todos.length}</div>
        <div>
          Rohan todos:{" "}
          {
            todos.filter(
              (t) => t.assigned_to_email === "rohanmehra224466@gmail.com"
            ).length
          }
        </div>
        <div>
          Ashish todos:{" "}
          {
            todos.filter(
              (t) => t.assigned_to_email === "ashish.efslon@gmail.com"
            ).length
          }
        </div>
      </div>
    </div>
  );
}
