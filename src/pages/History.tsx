import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Star } from "lucide-react";

interface Job {
  id: string;
  language: string;
  payment_amount: number;
  returned_at: string;
  rating: number | null;
  accepted_by: string;
  file_id: string;
  returned_file_id: string;
  shared_files: {
    filename: string;
    file_path: string;
  };
  returned_shared_files: {
    filename: string;
    file_path: string;
  };
  translator_profile: {
    username: string | null;
    rating: number | null;
  };
}

const History = () => {
  const { toast } = useToast();

  const { data: jobs, refetch } = useQuery({
    queryKey: ["returned-jobs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          language,
          payment_amount,
          returned_at,
          rating,
          accepted_by,
          file_id,
          returned_file_id,
          shared_files!file_id (
            filename,
            file_path
          ),
          returned_shared_files:shared_files!returned_file_id (
            filename,
            file_path
          ),
          translator_profile:profiles!inner(
            username,
            rating
          )
        `)
        .eq("status", "returned")
        .eq("accepted_by", "profiles.id")
        .order("returned_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Job[];
    },
  });

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Original File</TableHead>
              <TableHead>Returned File</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Returned At</TableHead>
              <TableHead>Translator</TableHead>
              <TableHead>Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs?.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadFile(
                        job.shared_files.file_path,
                        job.shared_files.filename
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {job.shared_files.filename}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadFile(
                        job.returned_shared_files.file_path,
                        job.returned_shared_files.filename
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {job.returned_shared_files.filename}
                  </Button>
                </TableCell>
                <TableCell>{job.language}</TableCell>
                <TableCell>${job.payment_amount}</TableCell>
                <TableCell>
                  {format(new Date(job.returned_at), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  {job.translator_profile.username} ({job.translator_profile.rating?.toFixed(1) ?? 0} ⭐)
                </TableCell>
                <TableCell>
                  {job.rating ? (
                    `${job.rating} ⭐`
                  ) : (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant="ghost"
                          size="icon"
                          onClick={() => submitRating(job.id, rating)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default History;