import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/dbConnect/dbConnect";
import User from "@/models/User.Model";
import Quiz from "@/models/Quiz.Model";
import { getDataFromToken } from "@/utils/GetDataFromToken";

connectDB();

export async function GET(request: NextRequest) {
    try {
      const userId = getDataFromToken(request);
      const user = await User.findById(userId);
      console.log(user);
      
  
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      const quizzes = await Quiz.find({ createdBy: userId });
  
      return NextResponse.json({
        name: user.name,
        email: user.email,
        quizzesCreated: quizzes.length,
        totalScore: user.totalScore, 
      }, { status: 200 });
  
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
