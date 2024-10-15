/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import router from "next/navigation";
import React from "react";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 px-4 sm:px-0">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-center">
            Welcome to <span className="text-yellow-400">QuizMaster</span>
          </h1>

          <nav className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6">
            <Link
              href="/signup"
              className="text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:ring-2 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-lg px-6 py-2 transition-colors duration-200"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="text-gray-100 bg-gray-700 hover:bg-gray-600 focus:ring-2 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-lg px-6 py-2 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/quizPageOne"
              className="text-gray-100 bg-gray-800 hover:bg-gray-600 focus:ring-2 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-lg px-6 py-2 transition-colors duration-200"
            >
              Home
            </Link>

          </nav>
        </div>
      </div>
    </>
  );
}
