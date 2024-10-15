"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  isLogin: boolean;
  quizCount: number;
}

const UserDetails = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); // Simulate loading delay
  }, []);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-red-600 text-center">
        Error: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-900">
        {/* Tailwind Loader */}
        <div className="w-16 h-16 border-4 border-yellow-500 border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const sortedUsers = [...users].sort((a, b) => b.quizCount - a.quizCount);

  return (
    <>
      <div className="w-full min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="max-w-5xl w-full p-6 bg-gray-900 rounded-lg shadow-md">
          {/* Flex container to align arrow and heading */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.push("/quizPageOne")}
              className="mr-4 p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200 ease-in-out"
            >
              {/* Small left arrow icon (using unicode or an SVG icon) */}←
            </button>
            <h2 className="text-3xl font-bold text-white text-center flex-grow">
              Score Board
            </h2>
          </div>

          {sortedUsers.length > 0 ? (
            <ul className="space-y-4">
              {sortedUsers.map((user) => (
                <li
                  key={user._id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-800 rounded-lg bg-gray-800 shadow hover:shadow-lg transition duration-200 ease-in-out"
                >
                  <div className="mb-2 md:mb-0">
                    <h3 className="text-xl font-semibold text-white">
                      {user.name}
                    </h3>
                    <p className="text-gray-400">{user.email}</p>
                    <p className="mt-2">
                      <strong
                        className={
                          user.isLogin ? "text-green-500" : "text-red-500"
                        }
                      >
                        {user.isLogin ? "Logged In" : "Not Logged In"}
                      </strong>
                    </p>
                  </div>
                  <div className="text-right w-full md:w-auto">
                    <p className="mt-2 text-gray-400">
                      <strong>Quizzes Created:</strong> {user.quizCount}
                    </p>
                    <button
                      onClick={() => router.push(`/totalUsers/${user._id}`)}
                      className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-200 ease-in-out"
                    >
                      View Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No users found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDetails;
