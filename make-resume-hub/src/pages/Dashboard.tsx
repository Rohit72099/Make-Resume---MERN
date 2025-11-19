import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, MessageSquare, Mic, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose how you want to create your resume today
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
            onClick={() => navigate('/app/create/form')}
          >
            <CardContent className="pt-6 text-center">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fill a Form</h3>
              <p className="text-muted-foreground mb-4">
                Step-by-step form to create your resume
              </p>
              <Button className="w-full">Start Form</Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary opacity-60"
          >
            <CardContent className="pt-6 text-center">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat with Bot</h3>
              <p className="text-muted-foreground mb-4">
                Answer questions in a conversation
              </p>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary bg-primary/5 border-dashed"
            onClick={() => navigate('/app/create/form?mode=voice')}
          >
            <CardContent className="pt-6 text-center">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Speak Your Info</h3>
              <p className="text-muted-foreground mb-4">
                Use the mic buttons inside the form to dictate your details
              </p>
              <Button variant="outline" className="w-full">
                Start Voice Mode
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/app/my-resumes')}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="bg-secondary/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">My Resumes</h3>
                <p className="text-sm text-muted-foreground">View and manage your resumes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/app/tips')}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="bg-secondary/10 p-3 rounded-full">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Tips & Examples</h3>
                <p className="text-sm text-muted-foreground">Learn how to write great resumes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
