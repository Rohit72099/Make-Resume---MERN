export interface ContactInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
}

export interface Experience {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface Education {
  degree?: string;
  institution?: string;
  location?: string;
  graduationYear?: string;
  grade?: string;
}

export interface Language {
  name?: string;
  proficiency?: string;
}

export interface PortfolioItem {
  type?: 'image' | 'video' | 'link';
  url?: string;
  caption?: string;
}

export interface ResumeVersion {
  title?: string;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  languages?: Language[];
  portfolioMedia?: PortfolioItem[];
}

export interface Resume {
  _id: string;
  id?: string;
  user?: string;
  contact: ContactInfo;
  profilePhotoUrl?: string;
  versions: ResumeVersion[];
  currentVersionIndex: number;
  publicSlug: string;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id?: string;
  id?: string;
  authorName?: string;
  text?: string;
  createdAt?: string;
}
