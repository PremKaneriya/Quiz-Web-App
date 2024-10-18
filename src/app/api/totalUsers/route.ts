import connectDB from "@/dbConnect/dbConnect"; // Adjust the path based on your folder structure
import User from "@/models/User.Model"; // Adjust the path based on your folder structure
import { NextRequest, NextResponse } from "next/server";

connectDB(); // Connect to the database

export async function GET(request: NextRequest) {
    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: "quizzes", // The name of your Quiz collection
                    localField: "_id", // User ID
                    foreignField: "createdBy", // The field in the Quiz collection that references User
                    as: "quizzes", // This will store the matched quizzes
                },
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    isLogin: 1,
                    totalScore: 1, // Make sure to include totalScore from the user collection
                    quizCount: { $size: "$quizzes" }, // Count the number of quizzes
                },
            },
        ]);

        return NextResponse.json({ users }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
