import { Header } from "@/components/Header";
import { ChatBox } from "@/components/ChatBox";

const AIHelper = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-4xl font-bold font-cambria">AI Helper</h1>
          <p className="text-lg text-muted-foreground">
            Utilize the chat for any questions that you might have about localizing.
          </p>
        </div>
        <ChatBox />
      </main>
    </div>
  );
};

export default AIHelper;