import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; 
  name: string;
  email: string;
  password: string;
  token?: string;
}

export interface IAsset extends Document {
  userId: mongoose.Types.ObjectId;
  nomeAtivo: string;
  quantidadeAtivos: number;
  valorAtivo: number;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  token: { type: String }
});

const AssetSchema = new Schema<IAsset>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nomeAtivo: { type: String, required: true },
  quantidadeAtivos: { type: Number, required: true },
  valorAtivo: { type: Number, required: true },
});

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export const Asset: Model<IAsset> = mongoose.model<IAsset>('Asset', AssetSchema);

export const createUser = async (user: Partial<IUser>): Promise<IUser> => {
  const newUser = new User(user);
  return await newUser.save();
};

export const findByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email });
};

export const updateUserToken = async (userId: mongoose.Types.ObjectId, token: string): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(userId, { token }, { new: true });
};
