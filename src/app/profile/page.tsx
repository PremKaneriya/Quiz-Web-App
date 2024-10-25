/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaSignOutAlt, FaArrowLeft } from "react-icons/fa";
import { Link } from "lucide-react";
import { h1 } from "framer-motion/client";

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
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Header with responsive margins and layout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-8 sm:mb-12">
              {/* User info and image */}
              <div className="flex items-center space-x-4">
                {/* Static image */}
                <img
                  src="https://cdn.dribbble.com/users/315465/screenshots/15748270/media/4cca4b90022715562c4459a8374e7b3c.png?resize=400x300&vertical=center"
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                    {user && user.name
                      ? `Oh, you're ${user.name}`
                      : "I don't know you, login for that"}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Additional content container with border and shadow */}
            <div className="bg-white rounded-xl shadow-sm border border-yellow-400 overflow-hidden">
              {/* ... additional content can be added here ... */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6">
            <div className="space-y-6">
              {/* Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Quizzes Created
                  </span>
                  <span className="font-semibold text-slate-800">
                    {user.quizzesCreated}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Total Score
                  </span>
                  <span className="font-semibold text-slate-800">
                    {user.totalScore}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Back Button */}
              <button
                onClick={handleBack}
                className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaArrowLeft className="text-sm" />
                <span>Back to Quiz</span>
              </button>

              {/* Login/Logout Button */}
              {user.name ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <FaSignOutAlt className="text-sm" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <span>Login</span>
                </button>
              )}

              {/* Optional: Additional Links */}
              <div className="text-center">
                <Link
                  href="/"
                  className="inline-block text-xs text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
