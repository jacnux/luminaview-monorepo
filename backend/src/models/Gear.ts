import mongoose, { Document, Schema } from 'mongoose';

export interface IGear {
  userId: mongoose.Types.ObjectId;
  type: 'camera' | 'lens' | 'eclairage';
  subType?: 'continuous' | 'flash'; // Pour type 'eclairage' : Lumière continue ou Flash
  brand: string;
  model: string;
  format?: string; // e.g. "35mm", "120", "Plein format", "APS-C" (ou 'N/A' pour eclairage)
  compatibleCameras?: mongoose.Types.ObjectId[]; // Pour type 'lens' : Boîtiers compatibles
  maxPowerWatts?: number; // Puissance maximale en Watts
  serialNumber?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const GearSchema = new Schema<IGear>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['camera', 'lens', 'eclairage'], required: true },
  subType: { type: String, enum: ['continuous', 'flash'] },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  format: { type: String, default: 'N/A' },
  compatibleCameras: [{ type: Schema.Types.ObjectId, ref: 'Gear' }],
  maxPowerWatts: { type: Number },
  serialNumber: { type: String },
  notes: { type: String }
}, { timestamps: true });

// Index unique pour éviter les doublons de matériel pour un même utilisateur
GearSchema.index({ userId: 1, brand: 1, model: 1 }, { unique: true });

export default mongoose.model<IGear>('Gear', GearSchema);
