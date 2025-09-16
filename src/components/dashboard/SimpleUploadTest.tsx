import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const SimpleUploadTest = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    
    if (file) {
      setSelectedFile(file);
      toast({
        title: "File Selected",
        description: `Selected: ${file.name} (${file.type}, ${file.size} bytes)`,
      });
    } else {
      setSelectedFile(null);
      toast({
        title: "No File",
        description: "No file selected",
        variant: "destructive"
      });
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      toast({
        title: "Upload Clicked",
        description: `Would upload: ${selectedFile.name}`,
      });
    } else {
      toast({
        title: "No File",
        description: "Please select a file first",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Upload Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        {selectedFile && (
          <div className="p-3 bg-gray-100 rounded">
            <p><strong>Selected File:</strong> {selectedFile.name}</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
            <p><strong>Size:</strong> {selectedFile.size} bytes</p>
          </div>
        )}
        
        <Button onClick={handleUpload} disabled={!selectedFile}>
          Upload File
        </Button>
      </CardContent>
    </Card>
  );
};
