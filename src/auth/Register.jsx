import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");

    const navigate = useNavigate();
    const auth = getAuth();

    // Register logic
    const handleRegister = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!")
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                createdAt: new Date(),
            });
            toast.success("Registration successful!")
            // Redirect to login page
            navigate("/d");
        } catch (error) {
            toast.error("Error registering: " + error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <ToastContainer />
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-center mb-4">
                    <img
                        src="/path-to-your-image/expense-register.png"
                        alt="Register Illustration"
                        className="h-20 w-20"
                    />
                </div>

                <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">Register for Expenses</h1>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-gray-300 rounded w-full p-3 focus:outline-none focus:border-blue-500"
                    />
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border border-gray-300 rounded w-full p-3 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleRegister}
                        className="bg-blue-500 text-white py-3 px-6 rounded w-full shadow hover:bg-blue-600 transition-all"
                    >
                        Register
                    </button>
                </div>

                <p className="text-sm text-center text-gray-500 mt-4">
                    Already have an account?{" "}
                    <button
                        onClick={() => navigate("/")} // Redirect to the login page
                        className="text-blue-500 hover:underline"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;
