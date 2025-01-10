import { format } from "date-fns";
import { Download, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Job } from "./types";

interface JobHistoryTableProps {
  jobs: Job[];
  onDownload: (filePath: string, fileName: string) => void;
  onRate: (jobId: string, rating: number) => void;
}

export const JobHistoryTable = ({ jobs, onDownload, onRate }: JobHistoryTableProps) => {
  return (
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
                  onDownload(
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
                  onDownload(
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
              {job.translator_profile?.username} ({job.translator_profile?.rating?.toFixed(1) ?? 0} ⭐)
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
                      onClick={() => onRate(job.id, rating)}
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
  );
};