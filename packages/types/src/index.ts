export interface PhotoExif {
  camera?: string;
  lens?: string;
  iso?: number;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
}

export interface Photo {
  _id: string;
  filename?: string;
  filepath?: string;
  path?: string;
  url?: string;
  title?: string;
  caption?: string;
  description?: string;
  category?: string;
  tags?: string[];
  exif?: PhotoExif;
  createdAt?: string;
}

export interface Album {
  _id: string;
  title: string;
  subtitle?: string;
  category?: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
  photos?: Photo[];
  createdAt?: string;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
}

export interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  bio?: string;
  portfolioIntro?: string;
  tagline?: string;
  bannerImage?: string;
  avatar?: string;
  avatarUrl?: string;
  profession?: string;
  hasBlog?: boolean;
  hasCarnet?: boolean;
  chambreNoireUrl?: string;
  blogTheme?: string;
  theme?: string;
  visualTheme?: 'default' | 'chambrenoire' | 'grimoire';
  socialLinks?: SocialLinks;
}

export interface UserPageSection {
  _id: string;
  type: 'text' | 'gallery' | 'image' | 'split_text_gallery';
  content?: string;
  albumIds?: Album[];
  imageUrl?: string;
  summary?: boolean;
}

export interface UserPage {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  coverImage?: string;
  isPublished?: boolean;
  menuGroup?: 'none' | 'series' | 'exhibitions' | 'blog' | 'about';
  parentPageId?: string | { _id: string; title: string; slug: string };
  menuOrder?: number;
  showInMenu?: boolean;
  sections?: UserPageSection[];
  editorialSummary?: string;
  childPages?: any[];
}

export interface BlogArticle {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
