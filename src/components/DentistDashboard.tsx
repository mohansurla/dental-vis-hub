import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase, type Scan } from '@/lib/supabase';
import { Eye, Download, Calendar, User, FileText, MapPin, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

export const DentistDashboard = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load scans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (scan: Scan) => {
    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(33, 150, 243); // Primary color
      pdf.text('OralVis Healthcare', 20, 30);
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Dental Scan Report', 20, 45);
      
      // Patient Information
      pdf.setFontSize(14);
      pdf.text('Patient Information:', 20, 65);
      pdf.setFontSize(12);
      pdf.text(`Name: ${scan.patient_name}`, 30, 80);
      pdf.text(`ID: ${scan.patient_id}`, 30, 95);
      
      // Scan Details
      pdf.setFontSize(14);
      pdf.text('Scan Details:', 20, 115);
      pdf.setFontSize(12);
      pdf.text(`Type: ${scan.scan_type}`, 30, 130);
      pdf.text(`Region: ${scan.region}`, 30, 145);
      pdf.text(`Upload Date: ${format(new Date(scan.upload_date), 'PPP')}`, 30, 160);
      
      // Add image if available
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          pdf.addImage(imgData, 'JPEG', 20, 180, 150, 100);
          pdf.save(`scan-report-${scan.patient_id}.pdf`);
        };
        img.src = scan.image_url;
      } catch (imgError) {
        // If image fails to load, save PDF without image
        pdf.save(`scan-report-${scan.patient_id}.pdf`);
      }
      
      toast({
        title: "PDF Downloaded",
        description: "Scan report has been downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "PDF Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const viewFullImage = (scan: Scan) => {
    setSelectedScan(scan);
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
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Dentist Dashboard</h1>
          <p className="text-muted-foreground">View and manage patient dental scans</p>
        </div>

        {scans.length === 0 ? (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No scans available</h3>
              <p className="text-muted-foreground">No dental scans have been uploaded yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scans.map((scan) => (
              <Card key={scan.id} className="shadow-lg border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    {scan.patient_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    ID: {scan.patient_id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden">
                    <img
                      src={scan.image_url}
                      alt={`Scan for ${scan.patient_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant="outline">{scan.scan_type}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Region:
                      </span>
                      <Badge variant="secondary">{scan.region}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Uploaded:
                      </span>
                      <span className="text-sm">{format(new Date(scan.upload_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => viewFullImage(scan)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 bg-primary hover:bg-primary-hover"
                      onClick={() => downloadPDF(scan)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Full Image Modal */}
        {selectedScan && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedScan(null)}
          >
            <div className="bg-background rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedScan.patient_name} - {selectedScan.region}
                </h3>
                <Button variant="outline" onClick={() => setSelectedScan(null)}>
                  Close
                </Button>
              </div>
              <img
                src={selectedScan.image_url}
                alt={`Full scan for ${selectedScan.patient_name}`}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};