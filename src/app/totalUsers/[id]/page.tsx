"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const UserDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => setLoading(false), 1000); // Example loading delay
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        const response = await fetch(`/api/totalUsers/${id}`);
        if (!response.ok) {
          setError("User not found");
          return;
        }
        const data = await response.json();
        console.log(data.user); // Log the user data for inspection
        setUser(data.user);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-900">
        {/* Tailwind Loader */}
        <div className="w-16 h-16 border-4 border-yellow-500 border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  return (
    <div className="w-full min-h-screen p-6 bg-gray-900 flex flex-col justify-center items-center">
      <div className="max-w-lg w-full bg-gray-700 rounded-lg shadow-md border p-6">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-200"
        >
          <strong>Back</strong>
        </button>
        <h1 className="text-2xl font-bold text-white mb-4 text-center md:text-left">
          {user.name}
        </h1>
        <p className="text-white mb-2">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-white mb-2">
          <strong>Status:</strong>{" "}
          <span className={user.isLogin ? "text-green-500" : "text-red-500"}>
            {user.isLogin ? "Logged In" : "Not Logged In"}
          </span>
        </p>
        <p className="text-white mb-2">
          <strong>Created At:</strong>{" "}
          {new Date(user.createdAt).toLocaleString()}
        </p>
        <p className="text-white mb-2">
          <strong>Updated At:</strong>{" "}
          {new Date(user.updatedAt).toLocaleString()}
        </p>
        <p className="text-white mb-2">
          <strong>Quizzes Created:</strong> {user.quizCount}
        </p>
      </div>
    </div>
  );
};

export default UserDetailPage;
