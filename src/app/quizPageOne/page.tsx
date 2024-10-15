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
} from "framer-motion/client";
import { useRouter } from "next/navigation";
import { type } from "os";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

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
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

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

  useEffect(() => {
    if (popupVisible) {
      const timer = setTimeout(() => {
        setPopupVisible(false); // Hide the popup after 5 seconds
      }, 5000);

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
    setSelectedAnswers((prev) => ({
      ...prev,
      [`${quizId}-${questionIndex}`]: optionIndex,
    }));
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

  return (
    <>
      <div
        className={`container mx-auto p-4 sm:p-6 space-y-8 ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-0">
            Quiz Manager
          </h1>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-5">
            {/* Profile Section */}
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-2 bg-violet-700 text-white px-4 py-2 rounded-lg transition duration-300 hover:bg-violet-500"
            >
              <img
                src="https://img.icons8.com/ios-filled/50/FFFFFF/user.png"
                alt="Profile"
                className="w-5 h-5"
              />
              <span className="text-sm sm:text-base">
                {user?.name || "Profile"}
              </span>
            </button>

            <button
              onClick={() => router.push("/totalUsers")}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 hover:bg-blue-500"
            >
              <span className="text-sm sm:text-base">🙏 Score Board</span>
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center justify-center w-28 h-9 rounded-lg text-sm transform transition-all duration-300 ease-in-out ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-300 hover:bg-gray-300 text-gray-800"
              } focus:ring-gray-500 shadow-md`}
            >
              <div className="flex items-center space-x-1">
                <span className="text-base">{darkMode ? "☀️" : "🌚"}</span>
                <span className="font-medium">
                  {darkMode ? "Light" : "Dark"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Create Quiz Form */}
        <div
          className={`shadow-sm rounded-lg p-4 sm:p-6 ${
            darkMode ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <h2
            className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Create New Quiz
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label
                htmlFor="title"
                className={`block text-sm sm:text-lg font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Quiz Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newQuiz.title}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 border-gray-600"
                    : "border-gray-300 text-gray-900"
                }`}
                placeholder="Enter quiz title"
                required
              />
            </div>

            {newQuiz.questions.map((question, qIndex) => (
              <div key={qIndex} className="space-y-4">
                <input
                  type="text"
                  value={question.questionText}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "questionText", e.target.value)
                  }
                  className={`block w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 border-gray-600"
                      : "border-gray-300 text-gray-900"
                  }`}
                  placeholder="Question text"
                  required
                />
                {question.options.map((option, oIndex) => (
                  <div
                    key={oIndex}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
                  >
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(
                          qIndex,
                          oIndex,
                          "text",
                          e.target.value
                        )
                      }
                      className={`flex-grow px-3 py-2 sm:px-4 sm:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 border-gray-600"
                          : "border-gray-300 text-gray-900"
                      }`}
                      placeholder="Option text"
                      required
                    />
                    <label
                      className={`flex items-center space-x-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) =>
                          handleOptionChange(
                            qIndex,
                            oIndex,
                            "isCorrect",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span>Correct</span>
                    </label>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={addQuestion}
                className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 hover:bg-green-700"
              >
                Add Question
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-600"
              >
                {loading ? "Creating..." : "Create Quiz"}
              </button>
            </div>
          </form>
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>

        {/* Display Quizzes */}
        <div className="max-w-full sm:max-w-3xl mx-auto px-2 sm:px-0">
          <h2
            className={`text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Play Quizzes
            <span className="text-gray-500 ml-2">↓</span>
          </h2>
          {loading && <p className="text-gray-500 mb-4">Loading quizzes...</p>}

          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className={`rounded-lg p-4 shadow-sm border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3
                  className={`text-lg sm:text-xl font-semibold mb-1 sm:mb-2 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {quiz.title}
                </h3>
                <p
                  className={`text-sm sm:text-base mb-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {quiz.questions.length} Questions
                </p>

                <div className="space-y-4">
                  {quiz.questions.map((question, qIndex) => (
                    <div key={qIndex} className="space-y-2">
                      <div
                        className={`rounded-lg p-3 border ${
                          darkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gray-50 border-gray-300"
                        }`}
                      >
                        <p
                          className={`text-sm sm:text-base font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Q{qIndex + 1}: {question.questionText}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <label
                            key={oIndex}
                            className="flex items-center space-x-2"
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
                              className="h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                            />
                            <span
                              className={`text-sm sm:text-base ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {option.text}
                            </span>
                          </label>
                        ))}
                      </div>

                      <button
                        onClick={() => checkAnswer(quiz._id, qIndex)}
                        className={`mt-2 bg-yellow-500 text-white px-3 py-1 rounded-md text-sm font-medium ${
                          darkMode
                            ? "hover:bg-yellow-600"
                            : "hover:bg-yellow-600"
                        }`}
                      >
                        Check Answer
                      </button>

                      {feedback[`${quiz._id}-${qIndex}`] && (
                        <p
                          className={`mt-2 text-sm font-medium ${
                            feedback[`${quiz._id}-${qIndex}`] === "Correct!"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {feedback[`${quiz._id}-${qIndex}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <p
                  className={`mt-4 text-sm sm:text-base ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Created by:{" "}
                  <span className="font-medium">
                    {quiz.createdBy || "Unknown"}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Popup Component */}
          {popupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 sm:p-8 md:p-10 lg:p-12 rounded shadow-lg max-w-sm sm:max-w-md lg:max-w-lg">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                  Brain-Building Game!
                </h2>
                <p className="text-sm sm:text-base md:text-lg">
                  This game is designed to improve your cognitive skills. Play
                  with your friends and challenge your brain!
                </p>
                <button
                  className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded text-sm sm:text-base"
                  onClick={handleClosePopup} // Allow user to close the popup
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuizManager;
