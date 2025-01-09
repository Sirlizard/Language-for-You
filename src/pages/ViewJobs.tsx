import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const ViewJobs = () => {
  const { toast } = useToast();

  const { data: jobs, refetch } = useQuery({
    queryKey: ["available-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          language,
          payment_amount,
          file_id,
          shared_files (
            filename
          )
        `)
        .eq("status", "open");

      if (error) throw error;
      return data;
    },
  });

  const acceptJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          status: "accepted",
          accepted_by: (await supabase.auth.getUser()).data.user?.id,
          accepted_at: new Date().toISOString(),
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job accepted successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error accepting job:", error);
      toast({
        title: "Error",
        description: "Failed to accept job",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs?.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.shared_files.filename}</TableCell>
                <TableCell>{job.language}</TableCell>
                <TableCell>${job.payment_amount}</TableCell>
                <TableCell>
                  <Button onClick={() => acceptJob(job.id)}>Accept Job</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ViewJobs;