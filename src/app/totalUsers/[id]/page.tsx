"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const UserDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!user) return <div className="text-center">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-300 transition"
      >
        Back
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left">
        {user.name}
      </h1>
      <p className="text-gray-600 mb-2">
        <strong>Email:</strong> {user.email}
      </p>
      <p className="text-gray-600 mb-2">
        <strong>Status:</strong>{" "}
        <span className={user.isLogin ? "text-green-600" : "text-red-600"}>
          {user.isLogin ? "Logged In" : "Not Logged In"}
        </span>
      </p>
      <p className="text-gray-600 mb-2">
        <strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}
      </p>
      <p className="text-gray-600 mb-2">
        <strong>Updated At:</strong> {new Date(user.updatedAt).toLocaleString()}
      </p>
      <p className="text-gray-600 mb-2">
        <strong>Quizzes Created:</strong> {user.quizCount}
      </p>
    </div>
  );
};

export default UserDetailPage;
