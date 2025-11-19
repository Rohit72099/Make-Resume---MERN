import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { resumeService } from '@/services/api';
import { FileText, Download, QrCode, Eye, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Resume } from '@/types/resume';

const MyResumes = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await resumeService.getMyResumes();
      setResumes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load resumes:', error);
      toast.error('Failed to load your resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (id: string, name: string) => {
    try {
      const blob = await resumeService.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your resumes...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Resumes</h1>
            <p className="text-muted-foreground">Manage and share your professional resumes</p>
          </div>
          <Button onClick={() => navigate('/app/create/form')} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>

        {resumes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No resumes yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first professional resume to get started
              </p>
              <Button onClick={() => navigate('/app/create/form')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Resume
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, index) => {
              const resumeId = resume._id || resume.id;
              if (!resumeId) {
                return null;
              }
              const versions = resume.versions || [];
              const currentVersion = versions[resume.currentVersionIndex] || versions[0];
              return (
                <Card key={resumeId ?? index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg truncate">
                          {resume.contact?.fullName || 'Untitled Resume'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {currentVersion?.title || 'Resume'}
                        </p>
                      </div>
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      {currentVersion?.experience?.length || 0} jobs • {' '}
                      {currentVersion?.skills?.length || 0} skills
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/app/resume/${resumeId}/preview`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View & Edit
                    </Button>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(resumeId, resume.contact?.fullName || 'Resume')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/app/resume/${resumeId}/preview?tab=qr`)}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        QR
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyResumes;
