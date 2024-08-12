import mongoose from "mongoose";

const UserAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  quizId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Quiz" },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.UserAttempt ||
  mongoose.model("UserAttempt", UserAttemptSchema);
