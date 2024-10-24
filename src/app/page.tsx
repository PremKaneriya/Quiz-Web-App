/* eslint-disable react/no-unescaped-entities */
import { div, h1, span, nav } from "framer-motion/client";
import Link from "next/link";
import router from "next/navigation";
import React from "react";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 px-4 sm:px-0">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-center">
            Welcome to <span className="text-slate-600">QuizMaster</span>
          </h1>

          <nav className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6">
            <Link
              href="/signup"
              className="text-white bg-slate-800 hover:bg-slate-700 focus:ring-2 focus:outline-none focus:ring-slate-500 font-medium rounded-lg text-lg px-6 py-2 transition-colors duration-200 text-center"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="text-slate-700 bg-slate-100 hover:bg-slate-200 focus:ring-2 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-lg px-6 py-2 transition-colors duration-200 text-center border-2 border-yellow-400"
            >
              Login
            </Link>
            <Link
              href="/quizPageOne"
              className="text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 focus:ring-2 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-lg px-6 py-2 transition-colors duration-200 text-center"
            >
              Home
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
