import { Card } from "@/components/ui/card";
import { FileUp, Star, Clock, Upload, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

export function Dashboard() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const { data: files, refetch: refetchFiles } = useQuery({
    queryKey: ['shared-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      
      // Upload to storage
      const filePath = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('shared_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file metadata
      const { error: dbError } = await supabase
        .from('shared_files')
        .insert({
          filename: file.name,
          file_path: filePath,
          content_type: file.type,
          file_size: file.size,
          uploader_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      refetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 font-cambria animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Welcome back</h1>
        <Button disabled={uploading}>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
          />
          <Upload className="mr-2" />
          Upload File
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <FileUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold">4.8</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Projects</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Shared Files</h2>
          <div className="space-y-4">
            {files?.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-background rounded">
                    <FileUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{file.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}