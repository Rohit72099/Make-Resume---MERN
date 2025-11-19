import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tips = [
  {
    title: 'Keep It Focused',
    items: [
      'Use a clear one-line summary for each job highlighting outcome + skill',
      'Prioritize recent, relevant experience; remove older roles if space is tight',
    ],
  },
  {
    title: 'Quantify Achievements',
    items: [
      'Use numbers (₹, %, count) to show impact: “Increased sales 32% in 6 months”',
      'Add tools/tech stack next to responsibilities for quick scanning',
    ],
  },
  {
    title: 'Tailor for Each Role',
    items: [
      'Pick the template that fits the company vibe (Classic for corporate, Developer for tech)',
      'Use the “Skills” section to mirror keywords found in the job description',
    ],
  },
];

const sampleSummaries = [
  {
    role: 'Full Stack Developer',
    summary:
      'Full stack engineer with 4+ years in MERN stack, shipping responsive apps for 200K+ users. Obsessed with DX, automated testing, and performance budgets.',
  },
  {
    role: 'Operations Manager',
    summary:
      'Operations lead who optimized delivery routes for 80+ drivers, cutting fuel burn by 18% while improving SLA to 97%. Skilled in vendor negotiations and training frontline teams.',
  },
];

const quickIdeas = [
  'Use the “Speak Your Info” shortcut to capture stories quickly, then edit text for grammar.',
  'Collect feedback through the Comments tab before finalizing a version.',
  'Generate multiple templates and share the appropriate QR link per opportunity.',
];

const TipsExamples = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container px-4 py-10 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-primary/70 mb-2">Tips & Examples</p>
            <h1 className="text-3xl font-bold">Make recruiters stop scrolling</h1>
            <p className="text-muted-foreground mt-2">
              Borrow these guidelines and ready-to-use summary snippets to tighten your resume before downloading or sharing.
            </p>
          </div>
          <Button onClick={() => navigate('/app/create/form')}>
            Apply Tips Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tips.map((tip) => (
            <Card key={tip.title} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {tip.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {tip.items.map((item) => (
                  <p key={item}>• {item}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Sample Summary Lines
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {sampleSummaries.map((sample) => (
              <div key={sample.role} className="rounded-lg border border-dashed border-primary/30 p-4 bg-primary/5">
                <Badge variant="outline" className="mb-3">
                  {sample.role}
                </Badge>
                <p className="text-sm">{sample.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Wins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {quickIdeas.map((idea) => (
              <p key={idea}>• {idea}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TipsExamples;

