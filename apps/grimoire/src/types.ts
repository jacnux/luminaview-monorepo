export interface Photo {
  _id: string;
  url?: string;
  filename?: string;
  filepath?: string;
  path?: string;
  title?: string;
  caption?: string;
  description?: string;
  category?: string;
  exif?: {
    camera?: string;
    lens?: string;
    iso?: number;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
  };
}

export interface Album {
  _id: string;
  title: string;
  subtitle?: string;
  category?: string;
  description?: string;
  coverImage?: string;
  photos?: Photo[];
  createdAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  portfolioIntro?: string;
  tagline?: string;
  bannerImage?: string;
  avatar?: string;
  avatarUrl?: string;
  profession?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
}

export interface UserPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  isPublished?: boolean;
}
