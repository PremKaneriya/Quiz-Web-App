import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest) => {
  try {
    // Ensure the token is retrieved correctly from cookies
    const token = request.cookies.get("token")?.value || "";
    
    // Check if the token is not empty
    if (!token) {
      throw new Error("No token provided");
    }

    // Verify and decode the token
    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);

    return decodedToken.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
