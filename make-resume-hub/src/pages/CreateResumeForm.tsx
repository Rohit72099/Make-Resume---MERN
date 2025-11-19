import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { VoiceInputButton } from '@/components/VoiceInputButton';
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2 } from 'lucide-react';
import { resumeService } from '@/services/api';
import { toast } from 'sonner';
import type { ContactInfo, Experience, Education, ResumeVersion } from '@/types/resume';

const steps = [
  { id: 1, title: 'Personal Info', description: 'Basic contact details' },
  { id: 2, title: 'Work Experience', description: 'Your job history' },
  { id: 3, title: 'Education', description: 'Your qualifications' },
  { id: 4, title: 'Skills', description: 'Your capabilities' },
  { id: 5, title: 'Review', description: 'Check and submit' },
];

const contactSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  location: z.string().min(2, 'Location is required').max(100),
  linkedIn: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const mergeVoiceText = (current: string, incoming: string) => {
  if (!incoming) return current;
  if (!current) return incoming.trim();
  return `${current.trim()} ${incoming.trim()}`.trim();
};

const CreateResumeForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const voiceMode = searchParams.get('mode') === 'voice';
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Contact Info
  const [contact, setContact] = useState<ContactInfo>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    portfolio: '',
  });

  // Step 2: Experience
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    },
  ]);

  // Step 3: Education
  const [educationList, setEducationList] = useState<Education[]>([
    {
      degree: '',
      institution: '',
      location: '',
      graduationYear: '',
      grade: '',
    },
  ]);

  // Step 4: Skills
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (voiceMode) {
      toast.info('Voice mode enabled. Look for mic buttons on summary and experience fields.');
    }
  }, [voiceMode]);

  const progress = (currentStep / steps.length) * 100;

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const addEducation = () => {
    setEducationList([
      ...educationList,
      {
        degree: '',
        institution: '',
        location: '',
        graduationYear: '',
        grade: '',
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], [field]: value };
    setEducationList(updated);
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleVoiceSummary = (text: string) => {
    setSummary((prev) => mergeVoiceText(prev, text));
  };

  const handleVoiceExperienceDescription = (index: number, text: string) => {
    const currentDescription = experiences[index]?.description || '';
    updateExperience(index, 'description', mergeVoiceText(currentDescription, text));
  };

  const handleVoiceContactField = (field: keyof ContactInfo) => (text: string) => {
    setContact((prev) => ({
      ...prev,
      [field]: mergeVoiceText(prev[field] || '', text),
    }));
  };

  const handleVoiceExperienceField = (index: number, field: keyof Experience) => (text: string) => {
    const value = experiences[index]?.[field];
    if (typeof value === 'boolean') return;
    updateExperience(index, field, mergeVoiceText((value as string) || '', text));
  };

  const handleVoiceEducationField = (index: number, field: keyof Education) => (text: string) => {
    const value = educationList[index]?.[field] || '';
    updateEducation(index, field, mergeVoiceText(value, text));
  };

  const handleVoiceSkillInput = (text: string) => {
    setSkillInput((prev) => mergeVoiceText(prev, text));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      try {
        contactSchema.parse(contact);
        return true;
      } catch (error: any) {
        toast.error(error.errors[0]?.message || 'Please fill all required fields');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const version: ResumeVersion = {
        title: 'My Resume',
        summary: summary || `${contact.fullName} - Professional Resume`,
        experience: experiences.filter(exp => exp.title && exp.company),
        education: educationList.filter(edu => edu.degree && edu.institution),
        skills: skills,
        languages: [],
        portfolioMedia: [],
      };

      const resumeData = {
        contact,
        version,
      };

      const response = await resumeService.create(resumeData);
      toast.success('Resume created successfully!');
      const newResumeId = response?.resume?._id || response?.resume?.id;
      if (newResumeId) {
        navigate(`/app/resume/${newResumeId}/preview`);
      } else {
        navigate('/app/my-resumes');
      }
    } catch (error: any) {
      console.error('Failed to create resume:', error);
      toast.error(error.response?.data?.error || 'Failed to create resume');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  step.id === currentStep ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                <div className="hidden sm:block text-sm">{step.title}</div>
                <div className="text-xs sm:hidden">{step.id}</div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {voiceMode && (
          <div className="mb-6 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
            <p className="font-semibold mb-1">Voice mode ON</p>
            <p>
              Use the mic buttons inside this form to dictate summaries and job descriptions. Fill Step 1 normally, then tap the mic whenever you see it.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
            <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent>
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <VoiceInputButton
                      onResult={handleVoiceContactField('fullName')}
                      label="Speak your full name"
                      size="sm"
                    />
                  </div>
                  <Input
                    id="fullName"
                    placeholder="e.g., Raj Kumar"
                    value={contact.fullName}
                    onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="email">Email Address *</Label>
                    <VoiceInputButton
                      onResult={handleVoiceContactField('email')}
                      label="Speak your email"
                      size="sm"
                    />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., raj.kumar@example.com"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <VoiceInputButton
                      onResult={handleVoiceContactField('phone')}
                      label="Speak your phone number"
                      size="sm"
                    />
                  </div>
                  <Input
                    id="phone"
                    placeholder="e.g., +91 98765 43210"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="location">City or Village *</Label>
                    <VoiceInputButton
                      onResult={handleVoiceContactField('location')}
                      label="Speak your location"
                      size="sm"
                    />
                  </div>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={contact.location}
                    onChange={(e) => setContact({ ...contact, location: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="linkedIn">LinkedIn (optional)</Label>
                    <VoiceInputButton
                      onResult={handleVoiceContactField('linkedIn')}
                      label="Speak your LinkedIn URL"
                      size="sm"
                    />
                  </div>
                  <Input
                    id="linkedIn"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={contact.linkedIn}
                    onChange={(e) => setContact({ ...contact, linkedIn: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="portfolio">Portfolio Website (optional)</Label>
                    <VoiceInputButton
                      onResult={handleVoiceContactField('portfolio')}
                      label="Speak your portfolio URL"
                      size="sm"
                    />
                  </div>
                  <Input
                    id="portfolio"
                    placeholder="https://yourportfolio.com"
                    value={contact.portfolio}
                    onChange={(e) => setContact({ ...contact, portfolio: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Experience {index + 1}</h4>
                        {experiences.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <Label>Job Title</Label>
                            <VoiceInputButton
                              onResult={handleVoiceExperienceField(index, 'title')}
                              label={`Speak job title for experience ${index + 1}`}
                              size="sm"
                            />
                          </div>
                          <Input
                            placeholder="e.g., Sales Manager"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <Label>Company Name</Label>
                            <VoiceInputButton
                              onResult={handleVoiceExperienceField(index, 'company')}
                              label={`Speak company name for experience ${index + 1}`}
                              size="sm"
                            />
                          </div>
                          <Input
                            placeholder="e.g., ABC Corp"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <Label>Location</Label>
                          <VoiceInputButton
                            onResult={handleVoiceExperienceField(index, 'location')}
                            label={`Speak location for experience ${index + 1}`}
                            size="sm"
                          />
                        </div>
                        <Input
                          placeholder="e.g., Delhi"
                          value={exp.location}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <Label>Start Date</Label>
                            <VoiceInputButton
                              onResult={handleVoiceExperienceField(index, 'startDate')}
                              label={`Speak start date for experience ${index + 1}`}
                              size="sm"
                            />
                          </div>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <Label>End Date</Label>
                            <VoiceInputButton
                              onResult={handleVoiceExperienceField(index, 'endDate')}
                              label={`Speak end date for experience ${index + 1}`}
                              size="sm"
                            />
                          </div>
                          <Input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                            disabled={exp.current}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`current-${index}`}
                          checked={exp.current}
                          onCheckedChange={(checked) =>
                            updateExperience(index, 'current', checked)
                          }
                        />
                        <Label htmlFor={`current-${index}`}>I currently work here</Label>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <Label>Description</Label>
                          <VoiceInputButton
                            onResult={(text) => handleVoiceExperienceDescription(index, text)}
                            label={`Speak to fill experience ${index + 1}`}
                            size="sm"
                          />
                        </div>
                        <Textarea
                          placeholder="Tell us about your responsibilities and achievements..."
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          className="mt-1.5 min-h-24"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addExperience} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Job
                </Button>
              </div>
            )}

            {/* Step 3: Education */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {educationList.map((edu, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Education {index + 1}</h4>
                        {educationList.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <Label>Degree / Certificate</Label>
                          <VoiceInputButton
                            onResult={handleVoiceEducationField(index, 'degree')}
                            label={`Speak degree for education ${index + 1}`}
                            size="sm"
                          />
                        </div>
                        <Input
                          placeholder="e.g., Bachelor of Commerce"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <Label>School / College Name</Label>
                          <VoiceInputButton
                            onResult={handleVoiceEducationField(index, 'institution')}
                            label={`Speak institution for education ${index + 1}`}
                            size="sm"
                          />
                        </div>
                        <Input
                          placeholder="e.g., Mumbai University"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <Label>Location</Label>
                            <VoiceInputButton
                              onResult={handleVoiceEducationField(index, 'location')}
                              label={`Speak location for education ${index + 1}`}
                              size="sm"
                            />
                          </div>
                          <Input
                            placeholder="e.g., Mumbai"
                            value={edu.location}
                            onChange={(e) => updateEducation(index, 'location', e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <Label>Graduation Year</Label>
                            <VoiceInputButton
                              onResult={handleVoiceEducationField(index, 'graduationYear')}
                              label={`Speak graduation year for education ${index + 1}`}
                              size="sm"
                            />
                          </div>
                          <Input
                            placeholder="e.g., 2020"
                            value={edu.graduationYear}
                            onChange={(e) =>
                              updateEducation(index, 'graduationYear', e.target.value)
                            }
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <Label>Grade / Percentage (optional)</Label>
                          <VoiceInputButton
                            onResult={handleVoiceEducationField(index, 'grade')}
                            label={`Speak grade for education ${index + 1}`}
                            size="sm"
                          />
                        </div>
                        <Input
                          placeholder="e.g., 85%"
                          value={edu.grade}
                          onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addEducation} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Qualification
                </Button>
              </div>
            )}

            {/* Step 4: Skills */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <VoiceInputButton
                      onResult={handleVoiceSummary}
                      label="Speak to add your summary"
                      size="sm"
                    />
                  </div>
                  <Textarea
                    id="summary"
                    placeholder="Brief description about yourself and your career goals..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="mt-1.5 min-h-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mic support works best in Chrome/Edge with Indian English voice. Each recording appends to the existing text.
                  </p>
                </div>
                <div>
                  <Label htmlFor="skills">Add Your Skills</Label>
                  <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                    <div className="flex gap-2 flex-1">
                      <Input
                        id="skills"
                        placeholder="e.g., Microsoft Excel"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        className="flex-1"
                      />
                      <VoiceInputButton
                        onResult={handleVoiceSkillInput}
                        label="Speak a skill"
                        size="icon"
                      />
                    </div>
                    <Button onClick={addSkill} type="button" className="shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <div
                        key={skill}
                        className="bg-primary/10 text-primary px-3 py-1.5 rounded-full flex items-center gap-2"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-1 text-sm">
                    <p><strong>Name:</strong> {contact.fullName}</p>
                    <p><strong>Email:</strong> {contact.email}</p>
                    <p><strong>Phone:</strong> {contact.phone}</p>
                    <p><strong>Location:</strong> {contact.location}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Work Experience ({experiences.filter(e => e.title).length})
                  </h3>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Education ({educationList.filter(e => e.degree).length})
                  </h3>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Skills ({skills.length})</h3>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentStep < steps.length ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Resume
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateResumeForm;
