/* eslint-disable react/no-unescaped-entities */
"use client";

// pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { type } from "os";

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-pink-500 px-4 sm:px-0 relative">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Hero Image */}
      <div className="absolute inset-0 opacity-20"></div>

      <div className="relative z-10 w-full max-w-lg bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-purple-800 mb-6 sm:mb-8">
          Welcome Back! 🧠
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-800"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={user.email}
              onChange={handleInputChange}
              className="mt-2 block w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-400 text-gray-900"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={user.password}
              onChange={handleInputChange}
              className="mt-2 block w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-400 text-gray-900"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="text-right text-sm">
            <a href="#" className="text-indigo-600 hover:text-indigo-800">
              Forgot password?
            </a>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 sm:px-5 sm:py-3 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 transition ease-in-out duration-150 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              Sign up
            </a>
          </p>
          <a
            href="/"
            className=" text-indigo-600 text-xs px-3 py-1 bg-gray-100 rounded hover:text-indigo-800 transition duration-300"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
