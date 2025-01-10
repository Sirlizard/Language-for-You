import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { JobHistoryTable } from "@/components/history/JobHistoryTable";
import { useJobHistory } from "@/hooks/useJobHistory";

const History = () => {
  const { toast } = useToast();
  const { data: jobs, refetch } = useJobHistory();

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("shared_files")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const submitRating = async (jobId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ rating })
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rating submitted successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Job History</h1>
        <JobHistoryTable
          jobs={jobs ?? []}
          onDownload={downloadFile}
          onRate={submitRating}
        />
      </div>
    </div>
  );
};

export default History;