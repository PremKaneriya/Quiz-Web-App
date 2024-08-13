"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

// Define the types
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

// Function to process MongoDB data format
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

  useEffect(() => {
    fetchQuizzes();
  }, []);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Check if the quiz title is at least 4 characters long
    if (newQuiz.title.length < 4) {
      setError("Quiz title must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // Ensure cookies are sent
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

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900">Quiz Manager</h1>

      {/* Create Quiz Form */}
      <div className="bg-gray-50 shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Create New Quiz
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-lg font-medium text-gray-700"
            >
              Quiz Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newQuiz.title}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Question text"
              />
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, "text", e.target.value)
                    }
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Option text"
                  />
                  <label className="flex items-center space-x-2 text-sm text-gray-700">
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
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>Correct</span>
                  </label>
                </div>
              ))}
            </div>
          ))}

          <div className="flex space-x-4">
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
              className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>

      {/* Display Quizzes */}

      <div className="max-w-3xl mx-auto px-0">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Play Quizzes
          {/* // add emoji down arrow */}
                        <span className="text-gray-500 ml-2">↓</span>
        </h2>
        {loading && <p className="text-gray-500 mb-4">Loading quizzes...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {quiz.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {quiz.questions.length} Questions
              </p>

              <div className="space-y-2">
                {quiz.questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-300">
                      <p className="text-sm font-medium text-gray-700">
                        Q{index + 1}: {question.questionText}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {question.options.map((option, oIndex) => (
                        <p key={oIndex} className="text-sm text-gray-600">
                          • {option.text}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Created by:{" "}
                <span className="font-medium text-gray-700">
                  {quiz.createdBy || "Unknown"}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizManager;
