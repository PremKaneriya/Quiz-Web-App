"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaSignOutAlt, FaArrowLeft } from "react-icons/fa";
import { div, h1, p, span, button } from "framer-motion/client";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "",
    email: "",
    quizzesCreated: 0,
    totalScore: 0,
  });
  const [error, setError] = useState("");

  // Fetch user data when the component loads
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/quizzes/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load user data");
        }

        setUser({
          name: data.name,
          email: data.email,
          quizzesCreated: data.quizzesCreated,
          totalScore: data.totalScore,
        });
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error: any) {
      toast.error("Failed to logout.");
    }
  };

  const handleBack = () => {
    router.push("/quizPageOne"); // Route back to quizPageOne
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-100 mt-4">{user.name}</h1>
          <p className="text-sm text-gray-400">{user.email}</p>
          <p className="text-lg font-medium text-gray-300 mt-2">
            Quizzes Created:{" "}
            <span className="font-bold text-yellow-400">
              {user.quizzesCreated}
            </span>
          </p>
          <p className="text-lg font-medium text-gray-300 mt-2">
            Total Score:{" "}
            <span className="font-bold text-yellow-400">{user.totalScore}</span>
          </p>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        )}

        <div className="text-center mb-4 w-full">
          <button
            onClick={handleBack}
            className="flex items-center justify-center space-x-2 px-4 py-3 font-medium text-gray-900 bg-yellow-400 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition duration-150 ease-in-out w-full"
          >
            <FaArrowLeft />
            <span>Back to Quiz</span>
          </button>
        </div>

        <div className="text-center w-full">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 px-4 py-3 font-medium text-gray-100 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out w-full"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
