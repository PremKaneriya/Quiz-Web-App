import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/dbConnect/dbConnect";
import User from "@/models/User.Model";
import { getDataFromToken } from "@/utils/GetDataFromToken";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.isLogin = false;
    await user.save();

    const response = NextResponse.json(
      {
        message: "Logout successful",
        user: {
          name: user.name,
          email: user.email,
          totalScore: user.totalScore,
        },
      },
      { status: 200 }
    );
    
    response.cookies.delete("token"); 
    return response;

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
