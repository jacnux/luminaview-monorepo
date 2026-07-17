import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author?: string;
  isPublished: boolean;
  createdAt: Date;
}

const PostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  author: { type: String },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPost>('Post', PostSchema);
