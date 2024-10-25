/* eslint-disable react/no-unescaped-entities */
"use client";

// pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { type } from "os";
import {
  div,
  h1,
  form,
  label,
  input,
  a,
  button,
  p,
} from "framer-motion/client";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      localStorage.setItem("tab", "tab");

      toast.success("User logged in successfully!");
      router.push("/quizPageOne");
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Header with proper responsive margins */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-8 sm:mb-12">
              <div className="w-full sm:w-auto">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                  Welcome Back
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Login to get verified
                </p>
              </div>
            </div>

            {/* Rest of your content */}
            <div className="bg-white rounded-xl shadow-sm border border-yellow-400 overflow-hidden">
              {/* ... rest of your form content ... */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-yellow-400 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-600 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-600 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={user.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <a
                  href="#"
                  className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>

              {/* Sign Up Link */}
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-slate-800 hover:text-slate-600 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
                <Link
                  href="/"
                  className="inline-block text-xs text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
