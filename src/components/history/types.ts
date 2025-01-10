export interface Job {
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
  } | null;
}