import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Eye, Download, User, Hash, Scan, MapPin, Calendar, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import jsPDF from 'jspdf';

export const DentistDashboard = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
      toast({
        title: "Error loading scans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (scan) => {
    try {
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('OralVis Healthcare - Scan Report', 20, 30);
      
      // Add patient information
      pdf.setFontSize(12);
      pdf.text(`Patient Name: ${scan.patient_name}`, 20, 50);
      pdf.text(`Patient ID: ${scan.patient_id}`, 20, 60);
      pdf.text(`Scan Type: ${scan.scan_type}`, 20, 70);
      pdf.text(`Region: ${scan.region}`, 20, 80);
      pdf.text(`Upload Date: ${new Date(scan.upload_date).toLocaleDateString()}`, 20, 90);
      
      // Add image if available
      if (scan.image_url) {
        try {
          // Create a temporary image element to load the image
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          return new Promise((resolve, reject) => {
            img.onload = () => {
              try {
                // Calculate dimensions to fit image in PDF
                const maxWidth = 170;
                const maxHeight = 100;
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                  height = (height * maxWidth) / width;
                  width = maxWidth;
                }
                
                if (height > maxHeight) {
                  width = (width * maxHeight) / height;
                  height = maxHeight;
                }
                
                // Add image to PDF
                pdf.addImage(img, 'JPEG', 20, 110, width, height);
                
                // Save PDF
                pdf.save(`${scan.patient_name}_${scan.patient_id}_scan_report.pdf`);
                
                toast({
                  title: "PDF Generated",
                  description: "Scan report has been downloaded successfully",
                });
                
                resolve();
              } catch (error) {
                reject(error);
              }
            };
            
            img.onerror = () => {
              // If image fails to load, generate PDF without image
              pdf.text('Image could not be loaded', 20, 110);
              pdf.save(`${scan.patient_name}_${scan.patient_id}_scan_report.pdf`);
              
              toast({
                title: "PDF Generated",
                description: "Scan report downloaded (image unavailable)",
              });
              
              resolve();
            };
            
            img.src = scan.image_url;
          });
        } catch (error) {
          console.error('Error adding image to PDF:', error);
          pdf.text('Image could not be loaded', 20, 110);
          pdf.save(`${scan.patient_name}_${scan.patient_id}_scan_report.pdf`);
        }
      } else {
        pdf.save(`${scan.patient_name}_${scan.patient_id}_scan_report.pdf`);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading scans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-medical-success/10 p-3 rounded-full">
              <Eye className="h-8 w-8 text-medical-success" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dentist Dashboard</h1>
          <p className="text-muted-foreground">View and manage patient dental scans</p>
        </div>

        {scans.length === 0 ? (
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-md">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Scan className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Scans Available</h3>
              <p className="text-muted-foreground text-center">
                No dental scans have been uploaded yet. Check back later or contact your technician.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scans.map((scan) => (
              <Card key={scan.id} className="shadow-xl border-0 bg-card/80 backdrop-blur-md hover:shadow-2xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-4 w-4 text-medical-success" />
                        {scan.patient_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Hash className="h-3 w-3" />
                        {scan.patient_id}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-medical-success/10 text-medical-success">
                      {scan.scan_type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Image Thumbnail */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/30">
                    {scan.image_url ? (
                      <img 
                        src={scan.image_url} 
                        alt={`Scan for ${scan.patient_name}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Scan Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>Region: {scan.region}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Uploaded: {new Date(scan.upload_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{scan.patient_name} - {scan.region} Scan</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Patient ID:</strong> {scan.patient_id}</div>
                            <div><strong>Scan Type:</strong> {scan.scan_type}</div>
                            <div><strong>Region:</strong> {scan.region}</div>
                            <div><strong>Upload Date:</strong> {new Date(scan.upload_date).toLocaleDateString()}</div>
                          </div>
                          {scan.image_url && (
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted/30">
                              <img 
                                src={scan.image_url} 
                                alt={`Full scan for ${scan.patient_name}`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 bg-medical-success hover:bg-medical-success/90"
                      onClick={() => generatePDF(scan)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};