"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineArrowLeft } from "react-icons/ai"; // Adjust based on your choice of icon
import { ok } from "assert";
import {
  body,
  button,
  div,
  form,
  h1,
  h3,
  input,
  label,
  map,
  span,
  text,
} from "framer-motion/client";
import { headers } from "next/headers";
import { title } from "process";
import { stringify } from "querystring";
import { type } from "os";
import { ArrowLeft } from "lucide-react";

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

const QuizCreation = () => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode state from localStorage when the component mounts
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode)); // parse and set the state
    }
  }, []);

  // Toggle dark mode and save the preference to localStorage
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", JSON.stringify(newMode)); // Save to localStorage
      return newMode;
    });
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
        throw new Error("Failed to create quiz, please login or signup");

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
                Create New Quiz
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Quiz Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-600 mb-2"
                >
                  Quiz Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newQuiz.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {newQuiz.questions.map((question, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-6 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-slate-800">
                        Question {qIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={question.questionText}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "questionText",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                      placeholder="Enter question text"
                      required
                    />

                    <div className="space-y-3 mt-4">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
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
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                            placeholder={`Option ${oIndex + 1}`}
                            required
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                handleOptionChange(
                                  qIndex,
                                  oIndex,
                                  "isCorrect",
                                  isChecked
                                );
                                if (isChecked) {
                                  question.options.forEach((_, idx) => {
                                    if (idx !== oIndex) {
                                      handleOptionChange(
                                        qIndex,
                                        idx,
                                        "isCorrect",
                                        false
                                      );
                                    }
                                  });
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                            />
                            <span className="text-sm text-slate-600">
                              Correct
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex-1"
                >
                  Add Question
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Quiz"}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizCreation;
