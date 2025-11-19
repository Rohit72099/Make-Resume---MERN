import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import type { Resume } from '@/types/resume';
import { TemplatePreview, TEMPLATE_OPTIONS, TemplateId } from '@/components/templates/ResumeTemplates';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { publicService } from '@/services/api';

const PublicResume = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTemplate = (searchParams.get('template') as TemplateId) || 'classic';

  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [templateId, setTemplateId] = useState<TemplateId>(initialTemplate);

  useEffect(() => {
    if (slug) {
      loadResume();
    }
  }, [slug]);

  useEffect(() => {
    const template = (searchParams.get('template') as TemplateId) || 'classic';
    setTemplateId(template);
  }, [searchParams]);

  const loadResume = async () => {
    try {
      const data = await publicService.getResume(slug!);
      setResume(data);
    } catch (error: any) {
      console.error('Failed to load resume:', error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Resume Not Found</h2>
            <p className="text-muted-foreground">
              The resume you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const versions = resume.versions || [];
  const currentVersion = versions[resume.currentVersionIndex] || versions[0];
  if (!currentVersion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/10 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container px-4 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MakeResume</span>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Template</Label>
            <Select
              value={templateId}
              onValueChange={(value: TemplateId) => {
                setTemplateId(value);
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set('template', value);
                  return next;
                });
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-8 max-w-4xl mx-auto space-y-6">
        <TemplatePreview templateId={templateId} resume={resume} version={currentVersion} />

        {/* Footer CTA */}
        <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold mb-2">Create Your Own Professional Resume</h3>
            <p className="mb-4 opacity-90">Build, share, and manage your resume in minutes</p>
            <a
              href="/"
              className="inline-block bg-background text-foreground px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Get Started Free
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12 bg-background">
        <div className="container px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 MakeResume. Powered by professional resume building.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicResume;
