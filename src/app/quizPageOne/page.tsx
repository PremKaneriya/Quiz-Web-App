"use client";
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
    <div className="container mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">
          Quiz Manager
        </h1>

        {/* GitHub Button */}
        <button
          onClick={() =>
            window.open("https://github.com/PremKaneriya", "_blank")
          }
          className="flex items-center space-x-2 bg-gray-900 text-white px-3 py-2 sm:py-1 rounded-lg hover:bg-gray-800 focus:outline-none"
        >
          <img
            src="https://img.icons8.com/m_sharp/200/FFFFFF/github.png"
            alt="GitHub"
            className="w-5 h-5"
          />
          <span className="text-sm font-medium">GitHub</span>
        </button>
      </div>

      {/* Create Quiz Form */}
      <div className="bg-gray-50 shadow-sm rounded-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
          Create New Quiz
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm sm:text-lg font-medium text-gray-700"
            >
              Quiz Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newQuiz.title}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                className="block w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                      handleOptionChange(qIndex, oIndex, "text", e.target.value)
                    }
                    className="flex-grow px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Option text"
                    required
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
              className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>

      {/* Display Quizzes */}
      <div className="max-w-full sm:max-w-3xl mx-auto px-2 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-4">
          Play Quizzes
          <span className="text-gray-500 ml-2">↓</span>
        </h2>
        {loading && <p className="text-gray-500 mb-4">Loading quizzes...</p>}

        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">
                {quiz.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                {quiz.questions.length} Questions
              </p>

              <div className="space-y-4">
                {quiz.questions.map((question, qIndex) => (
                  <div key={qIndex} className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-300">
                      <p className="text-sm sm:text-base font-medium text-gray-700">
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
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm sm:text-base text-gray-700">
                            {option.text}
                          </span>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={() => checkAnswer(quiz._id, qIndex)}
                      className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

              <p className="mt-4 text-sm sm:text-base text-gray-500">
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
