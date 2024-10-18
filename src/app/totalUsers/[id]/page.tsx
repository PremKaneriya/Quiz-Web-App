'use client'
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  isLogin: boolean;
  totalScore: number;
  createdAt: string;
  updatedAt: string;
  quizCount: number;
}

const UserDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/totalUsers/${id}`);
          if (!response.ok) {
            setError("User not found");
            return;
          }
          const data = await response.json();
          setUser(data.user);
        } catch (err) {
          setError("Failed to fetch user data");
        }
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-lg text-center">
          <span className="text-4xl mb-4 block">😕</span>
          <p className="text-gray-600">{error || "User not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <span className="text-xl group-hover:-translate-x-1 inline-block transition-transform">
              ←
            </span>
          </button>
          <h1 className="text-3xl font-semibold text-gray-900 ml-4">
            Profile Details
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* User Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span
                  className={`flex items-center gap-2 ${
                    user.isLogin ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      user.isLogin ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                  {user.isLogin ? "Online" : "Offline"}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Score</span>
                <span className="text-xl font-semibold text-gray-900">
                  {user.totalScore} 🏆
                </span>
              </div>

              {/* Quiz Count */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Quizzes Created</span>
                <span className="text-gray-900">{user.quizCount} 📝</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Dates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
