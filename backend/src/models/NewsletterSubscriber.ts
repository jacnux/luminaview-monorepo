import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NewsletterSubscriberSchema = new Schema({
  email: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure a user doesn't subscribe twice to the same blog
NewsletterSubscriberSchema.index({ email: 1, userId: 1 }, { unique: true });

export default mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);
