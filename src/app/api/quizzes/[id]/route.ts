import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/dbConnect/dbConnect";
import Quiz from "@/models/Quiz.Model";
import { getDataFromToken } from "@/utils/GetDataFromToken";

connectDB();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { quiz },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id;
    const reqBody = await req.json();
    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, reqBody, { new: true });

    if (!updatedQuiz) {
      return NextResponse.json(
        { message: "Quiz not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Quiz updated successfully", quiz: updatedQuiz },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id;
    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);

    if (!deletedQuiz) {
      return NextResponse.json(
        { message: "Quiz not found or not deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Quiz deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
