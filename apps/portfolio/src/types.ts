export interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  portfolioIntro?: string;
  bannerImage?: string;
  tagline?: string;
  hasBlog?: boolean;
  hasCarnet?: boolean;
  chambreNoireUrl?: string;
}

export interface Album {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  photos?: Photo[];
}

export interface Photo {
  _id: string;
  filename: string;
  title: string;
  description?: string;
  tags?: string[];
  createdAt: string;
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
  coverImage?: string;
  menuGroup: 'none' | 'series' | 'exhibitions' | 'blog' | 'about';
  parentPageId?: string | { _id: string; title: string; slug: string };
  menuOrder: number;
  showInMenu: boolean;
  sections?: UserPageSection[];
  editorialSummary?: string;
  childPages?: any[];
}
