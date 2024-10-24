/* eslint-disable @next/next/no-img-element */
"use client";
import {
  div,
  button,
  img,
  span,
  form,
  h1,
  h2,
  h3,
  input,
  label,
  map,
  p,
  text,
  title,
  filter,
  footer,
  strong,
  nav,
} from "framer-motion/client";
import { useRouter } from "next/navigation";
import { type } from "os";
import { parse } from "path";
import { stringify } from "querystring";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { SkeletonLoader } from "../components/skeleton";
import Link from "next/link";
import { X, Menu } from "lucide-react";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  questionText: string;
  options: Option[];
}

interface Quiz {
  _id: string;
  title: string;
  questions: Question[];
  createdBy: string;
}

const processMongoData = (data: any) => {
  return data.map((item: any) => ({
    _id: item._id,
    title: item.title,
    questions: item.questions.map((q: any) => ({
      questionText: q.questionText,
      options: q.options.map((o: any) => ({
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    })),
    createdBy: item.createdBy,
  }));
};

const QuizManager: React.FC = () => {
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [newQuiz, setNewQuiz] = useState<Quiz>({
    _id: "",
    title: "",
    questions: [],
    createdBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
  const [popupVisible, setPopupVisible] = useState(false); // State for the popup
  const [loginpopupVisible, setloginpopupVisible] = useState(false); // State for the popup
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Function to show the popup
  const showPopup = () => {
    setPopupVisible(true);
  };

  useEffect(() => {
    // Check if the user has already seen the popup
    const hasSeenPopup = localStorage.getItem("hasSeenPopup");
    if (!hasSeenPopup) {
      showPopup(); // Show the popup if it's the first login
    }
  }, []); // Run only on the first render

  const handleClosePopup = () => {
    localStorage.setItem("hasSeenPopup", "true"); // Mark the popup as seen
    setPopupVisible(false); // Hide the popup
  };

  const time = 400000;

  useEffect(() => {
    if (popupVisible) {
      const timer = setTimeout(() => {
        setPopupVisible(false); // Hide the popup after 5 seconds
      }, time);

      return () => clearTimeout(timer); // Clean up the timer on unmount
    }
  }, [popupVisible]);

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

        setUser({ name: data.name });
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/quizzes");
      if (!response.ok) throw new Error("Failed to fetch quizzes");
      const data = await response.json();
      const processedData = processMongoData(data.quiz);
      setQuizzes(processedData);
    } catch (err) {
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    setNewQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    field: keyof Option,
    value: string | boolean
  ) => {
    setNewQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        [field]: value,
      };
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const addQuestion = () => {
    setNewQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    }));
  };

  const validateQuiz = (): string | null => {
    if (newQuiz.title.length < 4) {
      return "Quiz title must be at least 4 characters long.";
    }
    if (newQuiz.questions.length === 0) {
      return "You must create at least one question.";
    }
    for (let i = 0; i < newQuiz.questions.length; i++) {
      const question = newQuiz.questions[i];
      if (question.questionText.trim() === "") {
        return `Question ${i + 1} text cannot be empty.`;
      }
      if (question.options.length < 2) {
        return `Question ${i + 1} must have at least two options.`;
      }
      if (!question.options.some((option) => option.isCorrect)) {
        return `Question ${i + 1} must have at least one correct option.`;
      }
      if (question.options.some((option) => option.text.trim() === "")) {
        return `All options in Question ${i + 1} must have text.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateQuiz();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newQuiz),
      });

      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in.");
      }

      if (!response.ok)
        throw new Error("Failed to create quiz or please login");

      await fetchQuizzes();
      setNewQuiz({ _id: "", title: "", questions: [], createdBy: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (
    quizId: string,
    questionIndex: number,
    optionIndex: number
  ) => {
    if (!user) {
      showLoginPopup();
      return;
    }
    setSelectedAnswers((prev) => ({
      ...prev,
      [`${quizId}-${questionIndex}`]: optionIndex,
    }));
  };

  const showLoginPopup = () => {
    setloginpopupVisible(true);
  };

  const handleCloseLoginPopup = () => {
    setloginpopupVisible(false); // Close popup when user clicks close
  };

  const checkAnswer = (quizId: string, questionIndex: number) => {
    const quiz = quizzes.find((q) => q._id === quizId);
    if (!quiz) return;

    const question = quiz.questions[questionIndex];
    const selectedOptionIndex = selectedAnswers[`${quizId}-${questionIndex}`];

    if (selectedOptionIndex === undefined) {
      setFeedback((prev) => ({
        ...prev,
        [`${quizId}-${questionIndex}`]: "Please select an answer.",
      }));
      return;
    }

    const isCorrect = question.options[selectedOptionIndex].isCorrect;
    setFeedback((prev) => ({
      ...prev,
      [`${quizId}-${questionIndex}`]: isCorrect
        ? "Correct!"
        : "Incorrect. Try again.",
    }));
  };

  const removeQuestion = (qIndex: any) => {
    setNewQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== qIndex),
    }));
  };

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold">
                    <span className="text-yellow-500">Quiz</span>
                    <span className="text-slate-800">Master</span>
                  </h1>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-700 transition-colors"
                >
                  <span className="mr-2">👤</span>
                  <span>{user?.name || "Profile"}</span>
                </Link>

                <Link
                  href="/createquiz"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-600 transition-colors"
                >
                  <span className="mr-2">📝</span>
                  <span>Create Quiz</span>
                </Link>

                <Link
                  href="/totalUsers"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <span className="mr-2">🏆</span>
                  <span>Score Board</span>
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <span className="mr-2">🏠</span>
                  <span>Home</span>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`
            md:hidden fixed inset-0 z-50 bg-slate-800/50 backdrop-blur-sm transition-all duration-300
            ${
              isOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }
          `}
          >
            <div
              className={`
              fixed inset-y-0 left-0 w-64 bg-white shadow-xl 
              transform transition-all duration-300 ease-in-out
              ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}
            >
              <div className="flex flex-col p-4">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-semibold text-slate-800">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col space-y-4">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-2">👤</span>
                    <span>{user?.name || "Profile"}</span>
                  </Link>

                  <Link
                    href="/createquiz"
                    className="flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-2">📝</span>
                    <span>Create Quiz</span>
                  </Link>

                  <Link
                    href="/totalUsers"
                    className="flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-2">🏆</span>
                    <span>Score Board</span>
                  </Link>

                  <Link
                    href="/"
                    className="flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-2">🏠</span>
                    <span>Home</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto p-4 sm:p-6 space-y-8">
          <div className="max-w-3xl mx-auto px-2 sm:px-0">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-slate-800">
              Play Quizzes
              <span className="text-slate-400 ml-2">↓</span>
            </h2>

            {loading && <SkeletonLoader />}

            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="rounded-xl p-6 shadow-sm border border-slate-200 bg-white"
                >
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-800">
                    {quiz.title}
                  </h3>
                  <p className="text-sm sm:text-base mb-4 text-slate-600">
                    {quiz.questions.length} Questions
                  </p>

                  <div className="space-y-6">
                    {quiz.questions.map((question, qIndex) => (
                      <div key={qIndex} className="space-y-3">
                        <div className="rounded-lg p-4 bg-slate-50 border border-slate-200">
                          <p className="text-sm sm:text-base font-medium text-slate-700">
                            Q{qIndex + 1}: {question.questionText}
                          </p>
                        </div>

                        <div className="space-y-2 pl-4">
                          {question.options.map((option, oIndex) => (
                            <label
                              key={oIndex}
                              className="flex items-center space-x-3 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`${quiz._id}-${qIndex}`}
                                checked={
                                  selectedAnswers[`${quiz._id}-${qIndex}`] ===
                                  oIndex
                                }
                                onChange={() =>
                                  handleAnswerSelect(quiz._id, qIndex, oIndex)
                                }
                                className="h-4 w-4 text-slate-600 border-slate-300 focus:ring-slate-500"
                              />
                              <span className="text-sm sm:text-base text-slate-600">
                                {option.text}
                              </span>
                            </label>
                          ))}
                        </div>

                        <button
                          onClick={() => checkAnswer(quiz._id, qIndex)}
                          className="px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-yellow-400 transition-colors"
                        >
                          Check Answer
                        </button>

                        {feedback[`${quiz._id}-${qIndex}`] && (
                          <p
                            className={`text-sm font-medium ${
                              feedback[`${quiz._id}-${qIndex}`] === "Correct!"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {feedback[`${quiz._id}-${qIndex}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-sm sm:text-base text-slate-500">
                    Created by:{" "}
                    <span className="font-medium">
                      {quiz.createdBy || "Unknown"}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            {loginpopupVisible && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all z-50">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm mx-4 transform transition-all">
                  <h2 className="text-2xl font-light text-gray-800 mb-4 text-center">
                    Please Log In
                  </h2>
                  <p className="text-gray-600 text-center mb-8">
                    You need to log in to play the quiz.
                  </p>
                  <div className="space-y-3">
                    <button
                      className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg transition-colors duration-200"
                      onClick={() => router.push("/login")}
                    >
                      Log In
                    </button>
                    <button
                      className="w-full text-gray-600 hover:text-gray-800 py-3 rounded-lg transition-colors duration-200"
                      onClick={handleCloseLoginPopup}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizManager;
