import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { resumeService } from '@/services/api';
import { Download, QrCode, Share2, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Resume, Comment } from '@/types/resume';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TemplatePreview, TEMPLATE_OPTIONS, TemplateId } from '@/components/templates/ResumeTemplates';

const ResumePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ name: '', text: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');

  useEffect(() => {
    if (id) {
      loadResume(id);
    }
  }, [id]);

  const loadResume = async (resumeId: string) => {
    try {
      const data = await resumeService.getResume(resumeId);
      setResume(data);
      setComments(data.comments || []);
    } catch (error: any) {
      console.error('Failed to load resume:', error);
      toast.error('Failed to load resume');
      navigate('/app/my-resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      const blob = await resumeService.downloadPDF(id, selectedTemplate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = resume?.contact?.fullName?.replace(/\s+/g, '_') || 'resume';
      a.download = `${safeName}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  useEffect(() => {
    if (resume) {
      setPublicUrl(`${window.location.origin}/r/${resume.publicSlug}?template=${selectedTemplate}`);
    }
  }, [resume, selectedTemplate]);

  const handleShowQR = async () => {
    if (!id || !resume) return;
    try {
      const data = await resumeService.getQR(id, selectedTemplate);
      setQrDataUrl(data.dataUrl);
      setPublicUrl(data.url || `${window.location.origin}/r/${resume.publicSlug}?template=${selectedTemplate}`);
      setShowQRModal(true);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const safeName = resume?.contact?.fullName?.replace(/\s+/g, '_') || 'resume';
    a.download = `${safeName}_qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR code downloaded!');
  };

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleAddComment = async () => {
    if (!newComment.name.trim() || !newComment.text.trim()) {
      toast.error('Please fill in both name and comment');
      return;
    }
    if (!id) return;

    try {
      await resumeService.addComment(id, newComment.name, newComment.text);
      toast.success('Comment added!');
      setNewComment({ name: '', text: '' });
      loadResume(id);
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading resume...</p>
        </div>
      </Layout>
    );
  }

  if (!resume) {
    return null;
  }

  const versions = resume.versions || [];
  const currentVersion = versions[resume.currentVersionIndex] || versions[0];
  if (!currentVersion) {
    return null;
  }

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">{resume.contact?.fullName || 'Resume'}</h1>
            <p className="text-muted-foreground">{currentVersion.title}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Template</Label>
              <Select value={selectedTemplate} onValueChange={(value: TemplateId) => setSelectedTemplate(value)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleDownloadPDF} size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handleShowQR} variant="outline" size="lg">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
          </div>
        </div>

        <Tabs defaultValue="preview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-6">
            <TemplatePreview templateId={selectedTemplate} resume={resume} version={currentVersion} />
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Add a Comment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="commentName">Your Name</Label>
                  <Input
                    id="commentName"
                    placeholder="e.g., John Doe"
                    value={newComment.name}
                    onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="commentText">Comment</Label>
                  <Textarea
                    id="commentText"
                    placeholder="Share your feedback..."
                    value={newComment.text}
                    onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                    className="mt-1.5 min-h-24"
                  />
                </div>
                <Button onClick={handleAddComment}>Post Comment</Button>
              </CardContent>
            </Card>

            {comments.length > 0 && (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment._id || comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-muted-foreground">{comment.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Resume</DialogTitle>
            <DialogDescription>
              Scan this QR code or share the link to view your resume online
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Resume QR Code" className="w-64 h-64" />
            )}
            <div className="flex gap-2 w-full">
              <Button onClick={handleDownloadQR} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </Button>
              <Button onClick={handleCopyLink} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ResumePreview;
