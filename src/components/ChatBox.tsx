import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ChatBox() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant", content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const newMessage = { role: "user" as const, content: message };
      setChatHistory(prev => [...prev, newMessage]);
      
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message, history: chatHistory }
      });

      if (error) throw error;

      const assistantMessage = { role: "assistant" as const, content: data.response };
      setChatHistory(prev => [...prev, assistantMessage]);
      setMessage("");
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-lg shadow p-4 min-h-[300px] max-h-[500px] overflow-y-auto space-y-4">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                : "bg-secondary text-secondary-foreground max-w-[80%]"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !message.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}