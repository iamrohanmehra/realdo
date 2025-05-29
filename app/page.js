import { ConnectionTest } from "../components/connection-test";

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Collaborative Todo App
      </h1>
      <ConnectionTest />
    </main>
  );
}
