import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const { token, user } = await authService.googleLogin(credentialResponse.credential);
      login(token, user);
      toast.success('Welcome back!');
      navigate('/app');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in failed. Please try again.');
  };

  if (!clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-accent/20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Configuration Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-accent/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">Welcome to MakeResume</CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to create and manage your professional resumes
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              size="large"
              text="continue_with"
              shape="rectangular"
              logo_alignment="left"
            />
            <p className="text-sm text-muted-foreground text-center px-8">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
