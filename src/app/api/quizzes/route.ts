import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/dbConnect/dbConnect";
import Quiz from "@/models/Quiz.Model";
import { getDataFromToken } from "@/utils/GetDataFromToken";
import jwt from "jsonwebtoken";

connectDB();

export async function GET(req: NextRequest) {
  try {
    const quiz = await Quiz.find();
    return NextResponse.json(
      {
        quiz,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        message: "No quiz found",
      },
      { status: 400 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const userId = await getDataFromToken(req);

    if (!userId) {
      return NextResponse.json(
        {
          error: "No token found",
          message: "No token found for User ID",
        },
        { status: 400 }
      );
    }

    const reqBody = await req.json();
    const { title, questions } = reqBody;

    const newQuiz = new Quiz({
      title,
      questions,
      createdBy: userId,
    });

    const savedQuiz = await newQuiz.save();

    return NextResponse.json(
      {
        message: "Quiz created successfully",
        quizInfo: savedQuiz,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        message: "No quiz found or No Quiz Created",
      },
      { status: 400 }
    );
  }
}
