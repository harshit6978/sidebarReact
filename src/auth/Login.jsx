import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();

  // Login logic
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!")
      navigate("/d"); // Redirect to dashboard
    } catch (error) {
      toast.error("Error logging in: " + error.message);
    }
  };

  return (
    <>
      <ToastContainer />
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center mb-4">
          <img
            src="/path-to-your-image/expense-login.png"
            alt="Login Illustration"
            className="h-20 w-20"
          />
        </div>

        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">Login to Expenses</h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded w-full p-3 focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded w-full p-3 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white py-3 px-6 rounded w-full shadow hover:bg-blue-600 transition-all"
          >
            Login
          </button>
        </div>

        <p className="text-sm text-center text-gray-500 mt-4">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/register")} // Redirect to the register page
            className="text-blue-500 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
    </>
  );
};

export default Login;
