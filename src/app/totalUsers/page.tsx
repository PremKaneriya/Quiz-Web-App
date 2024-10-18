'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  isLogin: boolean;
  quizCount: number;
  totalScore: number | null;
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
        if (!response.ok) throw new Error("Failed to fetch user details");
        const data = await response.json();
        setUsers(data.users);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <p className="text-red-500 flex items-center gap-2">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  const sortedUsers = [...users].sort(
    (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0)
  );

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0:
        return "🏆";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push("/quizPageOne")}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ←
          </button>
          <h1 className="text-3xl font-semibold text-gray-900 ml-4">
            👑 Leaderboard
          </h1>
        </div>

        {sortedUsers.length > 0 ? (
          <div className="space-y-4">
            {sortedUsers.map((user, index) => (
              <div
                key={user._id}
                className="bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-gray-400">👤</span>
                      {getMedalEmoji(index) && (
                        <span className="absolute -top-2 -right-2 text-xl">
                          {getMedalEmoji(index)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {user.name}
                      </h2>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {user.totalScore ?? 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.quizCount}{" "}
                      {user.quizCount === 1 ? "quiz" : "quizzes"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`text-sm flex items-center gap-1 ${
                      user.isLogin ? "text-green-500" : "text-gray-400"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block 
                      ${user.isLogin ? 'bg-green-500' : 'bg-gray-400'}"
                    ></span>
                    {user.isLogin ? "Online" : "Offline"}
                  </span>
                  <button
                    onClick={() => router.push(`/totalUsers/${user._id}`)}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors group flex items-center gap-1"
                  >
                    View Profile
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      →
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <span className="text-6xl mb-4 block">👤</span>
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
