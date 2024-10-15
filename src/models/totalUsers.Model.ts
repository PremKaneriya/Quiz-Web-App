import { Schema, model, models, Model } from 'mongoose';

// TypeScript interface for the user model
interface CreateUser {
    name: string;
    email: string;
    password: string;
    isLogin?: boolean;  // Optional with default in schema
    totalScore?: number; // Optional with default in schema
}

// Mongoose schema for the user model
const UserSchema = new Schema<CreateUser>(
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
        },
    },
    { timestamps: true }  // Automatically adds createdAt and updatedAt fields
);

// Ensure that the model is not created again if it already exists
const allUsers: Model<CreateUser> = models.User || model<CreateUser>('User', UserSchema);

export default allUsers;
