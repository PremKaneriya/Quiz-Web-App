// File: /app/api/totalUsers/[id]/route.ts

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectDB from '@/dbConnect/dbConnect';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    const connection = await connectDB(); // Get the connection object

    // Fetch the user data
    const user = await connection.collection('users').findOne({ _id: new ObjectId(id) });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Count quizzes created by the user
    const quizCount = await connection.collection('quizzes').countDocuments({ createdBy: new ObjectId(id) });

    // Return user data along with quiz count
    return NextResponse.json({ user: { ...user, quizCount } });
}
