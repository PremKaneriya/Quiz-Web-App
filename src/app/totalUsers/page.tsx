"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-red-100">
          <p className="text-red-400 flex items-center gap-2">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const sortedUsers = [...users].sort(
    (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0)
  );

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-700" />;
      default:
        return null;
    }
  };

  const getPositionStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-50 border-yellow-100";
      case 1:
        return "bg-slate-50 border-slate-100";
      case 2:
        return "bg-amber-50 border-amber-100";
      default:
        return "bg-white border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/quizPageOne")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                Leaderboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {users.length} participants
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {sortedUsers.length > 0 ? (
          <div className="space-y-3">
            {sortedUsers.map((user, index) => (
              <div
                key={user._id}
                className={`rounded-xl p-4 border transition-all duration-200 hover:shadow-md ${getPositionStyle(
                  index
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-100">
                      {getRankIcon(index) || (
                        <span className="text-sm font-medium text-slate-600">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-slate-800 font-medium">
                        {user.name}
                      </h2>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-800">
                      {user.totalScore ?? 0}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.quizCount}{" "}
                      {user.quizCount === 1 ? "quiz" : "quizzes"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`text-xs flex items-center gap-1 ${
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
                  <button
                    onClick={() => router.push(`/totalUsers/${user._id}`)}
                    className="text-xs text-slate-600 hover:text-slate-800 transition-colors group flex items-center gap-1"
                  >
                    Details
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      →
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500">No participants yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
