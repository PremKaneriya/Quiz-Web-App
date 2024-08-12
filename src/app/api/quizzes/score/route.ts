import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/dbConnect/dbConnect";
import Quiz from "@/models/Quiz.Model";
import User from "@/models/User.Model";
import UserAttempt from "@/models/Attempt.Model";
import { getDataFromToken } from "@/utils/GetDataFromToken";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);

    const query = request.nextUrl.searchParams;
    const id = query.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const previousAttempt = await UserAttempt.findOne({ userId, quizId: id });

    if (previousAttempt) {
      return NextResponse.json(
        { error: "You have already attempted this quiz. Please choose a different quiz." },
        { status: 400 }
      );
    }

    const { answers } = await request.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Answers must be an array and cannot be empty" },
        { status: 400 }
      );
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let score = 0;
    const totalQuestions = quiz.questions.length;
    const feedback: any = [];

    quiz.questions.forEach((question: any, index: number) => {
      const correctOptionIndex = question.options.findIndex(
        (opt: any) => opt.isCorrect
      );

      const userAnswerIndex = answers[index] - 1;

      if (userAnswerIndex === correctOptionIndex) {
        score += 1;
        feedback.push(`Question ${index + 1}: Correct`);
      } else {
        feedback.push(
          `Question ${index + 1}: Incorrect, correct answer is option ${correctOptionIndex + 1}`
        );
      }
    });

    await User.findByIdAndUpdate(userId, { $inc: { totalScore: score } });

    await UserAttempt.create({ userId, quizId: id });

    return NextResponse.json(
      {
        message: "Score calculated successfully",
        score,
        questions: totalQuestions,
        feedback,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
