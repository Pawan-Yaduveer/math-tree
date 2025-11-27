import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INode extends Document {
  userId?: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId | null;
  operation: 'start' | 'add' | 'subtract' | 'multiply' | 'divide';
  inputNumber?: number | null;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

const NodeSchema: Schema<INode> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  parentId: { type: Schema.Types.ObjectId, ref: 'Node', default: null },
  operation: { type: String, required: true },
  inputNumber: { type: Number, required: false },
  value: { type: Number, required: true },
}, { timestamps: true });

export const NodeModel: Model<INode> = mongoose.models.Node || mongoose.model<INode>('Node', NodeSchema);

export default NodeModel;
