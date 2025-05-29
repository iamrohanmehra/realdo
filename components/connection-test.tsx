"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { Button } from "../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function ConnectionTest() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("Error signing in:", error);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);
  };

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from("todos").select("*").limit(1);

      if (error) {
        setTestResult(`Database Error: ${error.message}`);
      } else {
        setTestResult("✅ Database connection successful!");
      }
    } catch (err) {
      setTestResult(`Connection Error: ${err}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-2xl font-semibold">
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <div>
            <p className="text-sm text-green-600">
              ✅ Signed in as: {user.email}
            </p>
            <Button
              onClick={signOut}
              variant="outline"
              size="default"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            onClick={signInWithGoogle}
            className="w-full"
            variant="default"
            size="default"
          >
            Sign in with Google
          </Button>
        )}

        <Button
          onClick={testDatabaseConnection}
          variant="secondary"
          className="w-full"
          size={undefined}
        >
          Test Database Connection
        </Button>

        {testResult && (
          <p className="text-sm p-2 bg-gray-100 rounded">{testResult}</p>
        )}
      </CardContent>
    </Card>
  );
}
