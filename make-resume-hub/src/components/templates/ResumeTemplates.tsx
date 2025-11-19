import type { Resume, ResumeVersion, Experience, Education } from '@/types/resume';
import { Mail, Phone, MapPin } from 'lucide-react';

export const TEMPLATE_OPTIONS = [
  { id: 'classic', label: 'Classic Blue', description: 'Balanced corporate layout' },
  { id: 'modern', label: 'Modern Gradient', description: 'Bold header with gradient accent' },
  { id: 'minimalist', label: 'Minimalist', description: 'Clean two-column focus' },
  { id: 'developer', label: 'Developer Dark', description: 'High-contrast tech resume' },
  { id: 'creative', label: 'Creative Accent', description: 'Vibrant cards and pill badges' },
] as const;

export type TemplateId = (typeof TEMPLATE_OPTIONS)[number]['id'];

interface TemplatePreviewProps {
  templateId: TemplateId;
  resume: Resume;
  version: ResumeVersion;
}

const Section = ({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-3 ${className}`}>
    <h3 className="text-base font-semibold tracking-wide uppercase">{title}</h3>
    {children}
  </div>
);

const ContactRow = ({ resume }: { resume: Resume }) => (
  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
    {resume.contact?.email && (
      <span className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        {resume.contact.email}
      </span>
    )}
    {resume.contact?.phone && (
      <span className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        {resume.contact.phone}
      </span>
    )}
    {resume.contact?.location && (
      <span className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {resume.contact.location}
      </span>
    )}
  </div>
);

const ExperienceBlock = ({ experience }: { experience: Experience }) => (
  <div className="space-y-1">
    <h4 className="font-semibold text-sm">{experience.title}</h4>
    <p className="text-sm text-muted-foreground">
      {experience.company} • {experience.location}
    </p>
    <p className="text-xs text-muted-foreground">
      {experience.startDate} - {experience.current ? 'Present' : experience.endDate}
    </p>
    {experience.description && <p className="text-sm leading-relaxed">{experience.description}</p>}
  </div>
);

const EducationBlock = ({ education }: { education: Education }) => (
  <div className="space-y-1">
    <h4 className="font-semibold text-sm">{education.degree}</h4>
    <p className="text-sm text-muted-foreground">{education.institution}</p>
    <p className="text-xs text-muted-foreground">
      {education.location} • {education.graduationYear}
      {education.grade ? ` • ${education.grade}` : ''}
    </p>
  </div>
);

const ClassicTemplate = ({ resume, version }: TemplatePreviewProps) => (
  <div className="rounded-2xl border bg-white p-8 shadow-sm">
    <header className="pb-6 border-b">
      <h1 className="text-3xl font-bold text-primary">{resume.contact?.fullName}</h1>
      <p className="text-lg text-muted-foreground">{version.title}</p>
      <ContactRow resume={resume} />
    </header>
    <main className="mt-6 space-y-6">
      {version.summary && (
        <Section title="Summary">
          <p className="text-sm leading-relaxed text-muted-foreground">{version.summary}</p>
        </Section>
      )}
      {version.experience?.length > 0 && (
        <Section title="Experience">
          <div className="space-y-4">
            {version.experience.map((exp, idx) => (
              <ExperienceBlock experience={exp} key={idx} />
            ))}
          </div>
        </Section>
      )}
      {version.education?.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {version.education.map((edu, idx) => (
              <EducationBlock education={edu} key={idx} />
            ))}
          </div>
        </Section>
      )}
      {version.skills?.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {version.skills.map((skill, idx) => (
              <span key={idx} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}
    </main>
  </div>
);

const ModernTemplate = ({ resume, version }: TemplatePreviewProps) => (
  <div className="rounded-2xl border bg-gradient-to-b from-slate-900 to-slate-800 text-slate-50 shadow-lg overflow-hidden">
    <header className="px-8 py-6 border-b border-slate-700">
      <h1 className="text-3xl font-bold">{resume.contact?.fullName}</h1>
      <p className="text-lg text-slate-300">{version.title}</p>
      <ContactRow resume={resume} />
    </header>
    <main className="grid gap-6 p-8 md:grid-cols-3">
      <div className="space-y-6 md:col-span-2">
        {version.summary && (
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400">About</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{version.summary}</p>
          </div>
        )}
        {version.experience?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400">Experience</h3>
            {version.experience.map((exp, idx) => (
              <div key={idx} className="rounded-xl bg-white/5 p-4">
                <ExperienceBlock experience={exp} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-6">
        {version.skills?.length > 0 && (
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400">Skills</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {version.skills.map((skill, idx) => (
                <span key={idx} className="rounded-lg bg-white/10 px-2 py-1 text-center">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {version.education?.length > 0 && (
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400">Education</h3>
            <div className="mt-3 space-y-3">
              {version.education.map((edu, idx) => (
                <EducationBlock education={edu} key={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  </div>
);

const MinimalistTemplate = ({ resume, version }: TemplatePreviewProps) => (
  <div className="rounded-2xl border bg-white shadow-sm">
    <div className="grid md:grid-cols-3">
      <aside className="space-y-6 border-r bg-slate-50 p-6">
        <div>
          <h1 className="text-2xl font-semibold">{resume.contact?.fullName}</h1>
          <p className="text-sm text-muted-foreground">{version.title}</p>
        </div>
        <ContactRow resume={resume} />
        {version.skills?.length > 0 && (
          <Section title="Skills" className="space-y-2">
            <ul className="space-y-1 text-sm">
              {version.skills.map((skill, idx) => (
                <li key={idx}>• {skill}</li>
              ))}
            </ul>
          </Section>
        )}
        {version.education?.length > 0 && (
          <Section title="Education">
            {version.education.map((edu, idx) => (
              <EducationBlock education={edu} key={idx} />
            ))}
          </Section>
        )}
      </aside>
      <section className="space-y-6 p-6 md:col-span-2">
        {version.summary && (
          <Section title="Profile">
            <p className="text-sm leading-relaxed text-muted-foreground">{version.summary}</p>
          </Section>
        )}
        {version.experience?.length > 0 && (
          <Section title="Experience">
            <div className="space-y-5">
              {version.experience.map((exp, idx) => (
                <ExperienceBlock experience={exp} key={idx} />
              ))}
            </div>
          </Section>
        )}
      </section>
    </div>
  </div>
);

const DeveloperTemplate = ({ resume, version }: TemplatePreviewProps) => (
  <div className="rounded-2xl border bg-slate-900 text-slate-100 shadow-lg overflow-hidden">
    <header className="bg-gradient-to-r from-emerald-400/20 to-blue-500/20 px-8 py-6 border-b border-white/10">
      <h1 className="text-3xl font-black tracking-tight">{resume.contact?.fullName}</h1>
      <p className="text-lg text-emerald-200">{version.title || 'Full Stack Developer'}</p>
      <ContactRow resume={resume} />
    </header>
    <main className="grid gap-6 p-8 md:grid-cols-5">
      <div className="space-y-6 md:col-span-3">
        {version.summary && (
          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-emerald-300">Mission</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{version.summary}</p>
          </div>
        )}
        {version.experience?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] text-emerald-300">Projects & Roles</h3>
            {version.experience.map((exp, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <ExperienceBlock experience={exp} />
                {exp.description && (
                  <p className="mt-2 text-xs text-emerald-100">
                    {exp.description.split('.').slice(0, 2).join('. ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-6 md:col-span-2">
        {version.skills?.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-emerald-300">Tech Stack</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {version.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-1 text-xs font-semibold text-emerald-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {version.education?.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-emerald-300">Education</h3>
            <div className="mt-3 space-y-3 text-sm">
              {version.education.map((edu, idx) => (
                <EducationBlock education={edu} key={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  </div>
);

const CreativeTemplate = ({ resume, version }: TemplatePreviewProps) => (
  <div className="rounded-2xl border bg-white shadow-lg overflow-hidden">
    <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-8 py-6 text-white">
      <p className="text-xs uppercase tracking-[0.3em] opacity-80">Resume</p>
      <h1 className="text-3xl font-bold">{resume.contact?.fullName}</h1>
      <p className="text-lg">{version.title}</p>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/80">
        {resume.contact?.email && <span>{resume.contact.email}</span>}
        {resume.contact?.phone && <span>{resume.contact.phone}</span>}
        {resume.contact?.location && <span>{resume.contact.location}</span>}
      </div>
    </div>
    <div className="p-8 space-y-6">
      {version.summary && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
          <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">About me</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{version.summary}</p>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-5">
          {version.experience?.length > 0 && (
            <>
              <h3 className="text-sm uppercase tracking-[0.25em] text-slate-400">Experience</h3>
              {version.experience.map((exp, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
                  <ExperienceBlock experience={exp} />
                </div>
              ))}
            </>
          )}
        </div>
        <div className="space-y-5">
          {version.skills?.length > 0 && (
            <div className="rounded-2xl border border-pink-100 bg-pink-50/60 p-5">
              <h3 className="text-sm font-semibold text-pink-600 uppercase tracking-wide mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {version.skills.map((skill, idx) => (
                  <span key={idx} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-pink-700 shadow">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {version.education?.length > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
              <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-3">Education</h3>
              <div className="space-y-3">
                {version.education.map((edu, idx) => (
                  <EducationBlock education={edu} key={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const templateMap: Record<TemplateId, React.FC<TemplatePreviewProps>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimalist: MinimalistTemplate,
  developer: DeveloperTemplate,
  creative: CreativeTemplate,
};

export const TemplatePreview = ({ templateId, resume, version }: TemplatePreviewProps) => {
  const TemplateComponent = templateMap[templateId] || ClassicTemplate;
  return <TemplateComponent templateId={templateId} resume={resume} version={version} />;
};


