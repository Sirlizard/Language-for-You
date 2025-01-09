import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Download } from "lucide-react";

interface Job {
  id: string;
  language: string;
  payment_amount: number;
  due_date: string;
  file_id: string;
  shared_files: {
    filename: string;
    file_path: string;
  };
}

const WorkingJobs = () => {
  const { data: jobs } = useQuery({
    queryKey: ["working-jobs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          language,
          payment_amount,
          due_date,
          file_id,
          shared_files (
            filename,
            file_path
          )
        `)
        .eq("status", "accepted")
        .eq("accepted_by", user?.id);

      if (error) throw error;
      return data as Job[];
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
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Working Jobs</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Due Date</TableHead>
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
                  {format(new Date(job.due_date), "MMM dd, yyyy")}
                </TableCell>
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
                    <Download className="mr-2" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WorkingJobs;