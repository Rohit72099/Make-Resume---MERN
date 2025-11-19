import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Mic, MessageSquare, QrCode, Download, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Header */}
      <header className="container px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">MakeResume</span>
          </div>
          <Link to="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Build Your Professional Resume in Minutes
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create, share, and manage your resume easily. Multiple ways to input—form, chat, or voice. Perfect for everyone.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              Get Started Free
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Create Your Way</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Simple Form</h3>
              <p className="text-muted-foreground">
                Fill out an easy step-by-step form. No technical skills needed.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <MessageSquare className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chat Style</h3>
              <p className="text-muted-foreground">
                Answer questions naturally like chatting with a friend.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <Mic className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Voice Input</h3>
              <p className="text-muted-foreground">
                Speak your information. We'll convert it to text automatically.
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-3xl font-bold text-center mb-12">Share & Manage</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <QrCode className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">QR Code Sharing</h3>
              <p className="text-muted-foreground">
                Generate a QR code for easy sharing with employers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Download className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">PDF Download</h3>
              <p className="text-muted-foreground">
                Download your resume as a professional PDF anytime.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Share2 className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Public Link</h3>
              <p className="text-muted-foreground">
                Share a mobile-friendly link that works on any device.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your Resume?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of job seekers who trust MakeResume
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Building Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
