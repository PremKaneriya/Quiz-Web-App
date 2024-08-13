import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="flex justify-center items-center mt-32 gap-4">
        <Link
          href="/signup"
          className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
        >
          Login
        </Link>
      </nav>
    </>
  );
}
