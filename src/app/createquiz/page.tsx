"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineArrowLeft } from "react-icons/ai"; // Adjust based on your choice of icon


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
  const [newQuiz, setNewQuiz] = useState<Quiz>({
    _id: "",
    title: "",
    questions: [],
    createdBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    setDarkMode(savedMode === "true");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const removeQuestion = (qIndex: number) => {
    setNewQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== qIndex),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
          <div className="p-6 relative">
            {/* Back Button */}
            <button
              type="button"
              className="absolute top-4 left-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              onClick={() => router.push("/quizPageOne")} // Navigate back to home
            >
              <AiOutlineArrowLeft className="mr-2" />
            </button>

            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Create New Quiz
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Quiz Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newQuiz.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div className="space-y-6">
                {newQuiz.questions.map((question, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Question {qIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700 transition"
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
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Enter question text"
                      required
                    />

                    <div className="space-y-3 mt-4">
                      {question.options.map((option, oIndex) => (
                        <div
                          key={oIndex}
                          className="flex items-center space-x-3"
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
                            className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder={`Option ${oIndex + 1}`}
                            required
                          />
                          <label className="flex items-center space-x-2">
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
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 transition"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Correct
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition w-full sm:w-auto"
                >
                  Add Question
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition w-full sm:w-auto"
                >
                  {loading ? "Creating..." : "Create Quiz"}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreation;
