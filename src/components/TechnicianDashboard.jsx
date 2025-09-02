import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Upload, FileImage, User, Hash, Scan, MapPin, Calendar } from 'lucide-react';

export const TechnicianDashboard = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    scanType: '',
    region: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG or PNG file",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload image to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `scans/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-scans')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('medical-scans')
        .getPublicUrl(filePath);

      // Save scan data to database
      const { error: dbError } = await supabase
        .from('scans')
        .insert([{
          patient_name: formData.patientName,
          patient_id: formData.patientId,
          scan_type: formData.scanType,
          region: formData.region,
          image_url: urlData.publicUrl,
          upload_date: new Date().toISOString(),
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Upload successful",
        description: "Scan has been uploaded and saved successfully",
      });

      // Reset form
      setFormData({
        patientName: '',
        patientId: '',
        scanType: '',
        region: '',
      });
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('scan-file');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-medical-info/10 p-3 rounded-full">
              <Upload className="h-8 w-8 text-medical-info" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Technician Dashboard</h1>
          <p className="text-muted-foreground">Upload and manage patient dental scans</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-medical-info" />
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
                  <Label htmlFor="patient-name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-medical-info" />
                    Patient Name
                  </Label>
                  <Input
                    id="patient-name"
                    type="text"
                    placeholder="Enter patient name"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient-id" className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-medical-info" />
                    Patient ID
                  </Label>
                  <Input
                    id="patient-id"
                    type="text"
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
                  <Label className="flex items-center gap-2">
                    <Scan className="h-4 w-4 text-medical-info" />
                    Scan Type
                  </Label>
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
                    <MapPin className="h-4 w-4 text-medical-info" />
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
                <Label htmlFor="scan-file" className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-medical-info" />
                  Scan Image
                </Label>
                <div className="relative">
                  <Input
                    id="scan-file"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    required
                    className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-medical-info hover:bg-medical-info/90" 
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Scan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};