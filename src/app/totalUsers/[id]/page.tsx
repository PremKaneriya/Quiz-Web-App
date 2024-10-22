"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trophy, User } from "lucide-react";

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
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-red-100 text-center">
          <span className="text-4xl mb-4 block">😕</span>
          <p className="text-red-400">{error || "User not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                User Profile
              </h1>
              <p className="text-sm text-slate-500 mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {/* User Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-800">
                  {user.name}
                </h2>
                <span
                  className={`text-sm flex items-center gap-1 mt-1 ${
                    user.isLogin ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.isLogin ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                  {user.isLogin ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-6">
              {/* Score */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Score</span>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-semibold text-slate-800">
                    {user.totalScore}
                  </span>
                </div>
              </div>

              {/* Quiz Count */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Quizzes Created</span>
                <span className="text-slate-800">
                  {user.quizCount} {user.quizCount === 1 ? "quiz" : "quizzes"}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Dates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500">Member Since</span>
                  <span className="text-slate-800">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="text-slate-800">
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
