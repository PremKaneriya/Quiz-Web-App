"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineArrowLeft } from "react-icons/ai"; // Adjust based on your choice of icon
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
  const [newQuiz, setNewQuiz] = useState<Quiz>({
    _id: "",
    title: "",
    questions: [],
    createdBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // New state for success notification
  const router = useRouter();

  useEffect(() => {
    fetchQuizzes();
  }, []);

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
      setSuccessMessage("Quiz created successfully!"); // Success message
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeQuestion = (qIndex: any) => {
    setNewQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== qIndex),
    }));
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push("/quizPageOne")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="ml-4 text-xl font-medium text-gray-800">Create Quiz</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm text-gray-600 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newQuiz.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-gray-400"
                  placeholder="Quiz title"
                  required
                />
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {newQuiz.questions.map((question, qIndex) => (
                  <div key={qIndex} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                    <div className="flex justify-between mb-3">
                      <span className="text-sm text-gray-600">Question {qIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-sm text-red-500"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                      className="w-full px-3 py-2 rounded border mb-3"
                      placeholder="Question text"
                      required
                    />

                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, "text", e.target.value)}
                            className="flex-1 px-3 py-2 rounded border"
                            placeholder={`Option ${oIndex + 1}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleOptionChange(qIndex, oIndex, "isCorrect", true);
                              question.options.forEach((opt, index) => {
                                if (index !== oIndex) {
                                  handleOptionChange(qIndex, index, "isCorrect", false);
                                }
                              });
                            }}
                            className={`p-2 rounded-lg ${option.isCorrect ? "bg-green-500" : "bg-gray-200"}`}
                          >
                            <span className="text-xs text-white">✓</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="w-full py-2 text-sm text-gray-600 border rounded hover:bg-gray-50"
              >
                Add Question
              </button>

              {/* Success and Error Messages */}
              {successMessage && (
                <div className="text-sm text-center text-green-500">{successMessage}</div>
              )}

              {error && (
                <div className="text-sm text-center text-red-500">{error}</div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                {loading ? "Creating..." : "Create Quiz"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizCreation;
