import mongoose, { model, models } from "mongoose";

interface CreateUser {
  name: string;
  email: string;
  password: string;
  isLogin: boolean;
  totalScore: number;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
    },
    isLogin: {
      type: Boolean,
      default: false,
    },
    totalScore: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

const User = models.User || model<CreateUser>("User", UserSchema);

export default User;
