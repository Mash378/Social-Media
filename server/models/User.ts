import mongoose, { Document, Schema, Model } from 'mongoose'

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
}

const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default UserModel;