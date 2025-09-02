import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Upload, Image, User, FileText, MapPin } from 'lucide-react';

export const TechnicianDashboard = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    scanType: 'RGB',
    region: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a JPG or PNG image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "Missing file",
        description: "Please select an image file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload image to Supabase storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${formData.patientId}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('scan-images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('scan-images')
        .getPublicUrl(fileName);

      // Save scan data to database
      const { error: dbError } = await supabase
        .from('scans')
        .insert({
          patient_name: formData.patientName,
          patient_id: formData.patientId,
          scan_type: formData.scanType,
          region: formData.region,
          image_url: urlData.publicUrl,
          upload_date: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful",
        description: "Scan has been uploaded and saved successfully",
      });

      // Reset form
      setFormData({
        patientName: '',
        patientId: '',
        scanType: 'RGB',
        region: '',
      });
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload scan",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Technician Dashboard</h1>
          <p className="text-muted-foreground">Upload and manage patient dental scans</p>
        </div>

        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Upload New Scan
            </CardTitle>
            <CardDescription>
              Fill in the patient details and upload the dental scan image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Patient Name
                  </Label>
                  <Input
                    id="patientName"
                    placeholder="Enter patient name"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientId" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Patient ID
                  </Label>
                  <Input
                    id="patientId"
                    placeholder="Enter patient ID"
                    value={formData.patientId}
                    onChange={(e) => handleInputChange('patientId', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scan Type</Label>
                  <Select value={formData.scanType} onValueChange={(value) => handleInputChange('scanType', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select scan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RGB">RGB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Region
                  </Label>
                  <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontal">Frontal</SelectItem>
                      <SelectItem value="Upper Arch">Upper Arch</SelectItem>
                      <SelectItem value="Lower Arch">Lower Arch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scanImage">Scan Image</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="scanImage"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="scanImage" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {selectedFile ? selectedFile.name : 'Click to upload JPG or PNG image'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Maximum file size: 10MB
                    </p>
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary-hover text-lg"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Scan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};