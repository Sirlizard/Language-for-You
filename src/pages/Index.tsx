import { Dashboard } from "@/components/Dashboard";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;