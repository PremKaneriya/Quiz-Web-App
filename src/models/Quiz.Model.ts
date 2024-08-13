import mongoose, { model, models } from "mongoose";

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true,
      },
      options: [
        {
          text: String,
          isCorrect: Boolean,
        },
      ],
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Quiz = models.Quiz || model("Quiz", QuizSchema);

export default Quiz;
