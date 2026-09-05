import mongoose, { Document, Schema } from 'mongoose';

export type ProjectStatus = 'IDEA' | 'PREPARATION' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type ProjectMedium = 'UNDECIDED' | 'DIGITAL' | 'ANALOG' | 'HYBRID';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  slug: string;
  status: ProjectStatus;
  medium: ProjectMedium;
  tags: string[];
  notesMarkdown: string;
  targetDate?: Date;
  isPublished: boolean;
  coverImage?: string;
  makingOf?: string; // Contenu Markdown du secret de fabrication du projet
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  slug: { type: String, required: true },
  status: {
    type: String,
    enum: ['IDEA', 'PREPARATION', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'],
    default: 'IN_PROGRESS'
  },
  medium: {
    type: String,
    enum: ['UNDECIDED', 'DIGITAL', 'ANALOG', 'HYBRID'],
    default: 'ANALOG'
  },
  tags: [{ type: String }],
  notesMarkdown: { type: String, default: '' },
  targetDate: { type: Date },
  isPublished: { type: Boolean, default: false },
  coverImage: { type: String },
  makingOf: { type: String, default: '' }
}, { timestamps: true });

// Un utilisateur ne peut pas avoir deux projets avec le même slug
ProjectSchema.index({ userId: 1, slug: 1 }, { unique: true });
ProjectSchema.index({ userId: 1, status: 1 });
ProjectSchema.index({ userId: 1, medium: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);

