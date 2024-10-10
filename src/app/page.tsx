/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-0 relative">
        {/* Background Illustration */}
        <div className="absolute inset-0 opacity-30"></div>

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col items-center space-y-4 sm:space-y-8">
          {/* Header Section */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-center">
            Welcome to <span className="text-yellow-300">QuizMaster</span> 🧠
          </h1>

          {/* Navigation Buttons */}
          <nav className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 sm:mt-10">
            <Link
              href="/signup"
              className="text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-semibold rounded-xl text-lg px-6 py-3 shadow-lg transition ease-in-out duration-150"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="text-white bg-pink-500 hover:bg-pink-600 focus:ring-4 focus:outline-none focus:ring-pink-300 font-semibold rounded-xl text-lg px-6 py-3 shadow-lg transition ease-in-out duration-150"
            >
              Login
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
