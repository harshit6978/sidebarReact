import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase"; // Firestore instance from your firebase component
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
  const [isLoginPage, setIsLoginPage] = useState(true); // State for toggling between Login and Register pages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For Register page
  const [confirmPassword, setConfirmPassword] = useState(""); // For Register page

  const navigate = useNavigate(); // To navigate to the dashboard
  const auth = getAuth(); // Firebase Authentication instance

  // Login Logic
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      navigate("/"); // Navigate to the dashboard after successful login
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  // Register Logic
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
      });

      alert("Registration successful!");
      navigate("/"); // Navigate to the dashboard after successful registration
    } catch (error) {
      alert("Error registering: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
        {/* Expense Image */}
        <div className="flex justify-center mb-4">
          <img
            src="/path-to-your-image/expense-login.png"
            alt={isLoginPage ? "Login Illustration" : "Register Illustration"}
            className="h-20 w-20"
          />
        </div>
        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          {isLoginPage ? "Login to Expenses" : "Register for Expenses"}
        </h1>
        {/* Form Fields */}
        <div className="space-y-4">
          {!isLoginPage && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded w-full p-3 focus:outline-none focus:border-blue-500"
            />
          )}
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
          {!isLoginPage && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-gray-300 rounded w-full p-3 focus:outline-none focus:border-blue-500"
            />
          )}
          <button
            onClick={isLoginPage ? handleLogin : handleRegister}
            className="bg-blue-500 text-white py-3 px-6 rounded w-full shadow hover:bg-blue-600 transition-all"
          >
            {isLoginPage ? "Login" : "Register"}
          </button>
        </div>
        {/* Link to toggle between Login and Register */}
        <p className="text-sm text-center text-gray-500 mt-4">
          {isLoginPage ? "Don’t have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLoginPage(!isLoginPage)}
            className="text-blue-500 hover:underline"
          >
            {isLoginPage ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
