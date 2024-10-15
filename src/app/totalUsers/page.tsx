"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Correct import for Next.js router
import { div, h2, ul, map, li, h3, p, strong, button } from "framer-motion/client";

interface User {
  _id: string; // Make sure to include the _id property for routing
  name: string;
  email: string;
  isLogin: boolean;
  quizCount: number;
}

const UserDetails = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("/api/totalUsers");

        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }

        const data = await response.json();
        setUsers(data.users);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchUserDetails();
  }, []);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-red-600 text-center">
        Error: {error}
      </div>
    );
  }

  // Sort users by quizCount in descending order
  const sortedUsers = [...users].sort((a, b) => b.quizCount - a.quizCount);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
  <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">User Details</h2>
  {sortedUsers.length > 0 ? (
    <ul className="space-y-4">
      {sortedUsers.map((user) => (
        <li
          key={user._id}
          className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-200 rounded-lg bg-gray-50 shadow hover:shadow-lg transition duration-200 ease-in-out"
        >
          <div className="mb-2 md:mb-0">
            <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <p className="mt-2">
              <strong className={user.isLogin ? "text-green-500" : "text-red-500"}>
                {user.isLogin ? "Logged In" : "Not Logged In"}
              </strong>
            </p>
          </div>
          <div className="text-right w-full md:w-auto">
            <p className="mt-2 text-gray-600">
              <strong>Quizzes Created:</strong> {user.quizCount}
            </p>
            <button
              onClick={() => router.push(`/totalUsers/${user._id}`)} // Adjust routing as needed
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 ease-in-out"
            >
              View Details
            </button>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-600 text-center">No users found.</p>
  )}
</div>

  );
};

export default UserDetails;
