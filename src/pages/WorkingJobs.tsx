import { useState } from "react";
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
import { Download, Upload } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const { data: jobs, refetch } = useQuery({
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
          shared_files!file_id (
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
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (jobId: string, file: File) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("shared_files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create shared_files record
      const { data: fileData, error: fileError } = await supabase
        .from("shared_files")
        .insert({
          filename: file.name,
          file_path: filePath,
          uploader_id: user.id,
          content_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (fileError) throw fileError;

      // Update job with returned file and status
      const { error: updateError } = await supabase
        .from("jobs")
        .update({
          returned_file_id: fileData.id,
          returned_at: new Date().toISOString(),
          status: "returned"
        })
        .eq("id", jobId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "File returned successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error returning file:", error);
      toast({
        title: "Error",
        description: "Failed to return file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
              <TableHead>Actions</TableHead>
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
                <TableCell className="space-x-2">
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
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    disabled={uploading}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleFileUpload(job.id, file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Return File
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