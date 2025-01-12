import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
}

export const FileUpload = ({ onFileChange }: FileUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/plain" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        onFileChange(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt or .docx file",
          variant: "destructive",
        });
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>Upload File (txt or docx)</Label>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.docx"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button 
        type="button" 
        onClick={handleButtonClick}
        className="w-full"
      >
        Choose File
      </Button>
    </div>
  );
};