import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Job } from "@/components/history/types";

export const useJobHistory = () => {
  return useQuery({
    queryKey: ["returned-jobs"],
    queryFn: async () => {
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
          translator_profile:profiles!jobs_accepted_by_fkey (
            username,
            rating
          )
        `)
        .eq("status", "returned")
        .order("returned_at", { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
  });
};