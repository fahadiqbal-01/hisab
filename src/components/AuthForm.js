"use client";
import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function AuthForm() {
  const router = useRouter();
  const [toggleSign, setToggleSign] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggleSign = () => {
    setToggleSign((prev) => !prev);
    setError("");
    setSuccess("");
  };

  const [formDataSignUp, setFormDataSignUp] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChangeSignUp = (e) => {
    const { name, value } = e.target;
    setFormDataSignUp((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataSignUp),
      });

      if (res.ok) {
        setSuccess("Account created successfully! Please sign in.");
        setToggleSign(false);
        setFormDataSignUp({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const [formDataSignIn, setFormDataSignIn] = useState({
    email: "",
    password: "",
  });

  const handleChangeSignIn = (e) => {
    const { name, value } = e.target;
    setFormDataSignIn((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await signIn("credentials", {
        email: formDataSignIn.email,
        password: formDataSignIn.password,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Invalid email or password");
        setLoading(false);
      }
    } catch (err) {
      setError("Sign in failed. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <main className="w-full h-screen flex justify-center items-center relative bg-black">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-10 bg-red-500/80 text-white px-6 py-2 rounded-full z-50 shadow-xl backdrop-blur-md"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-10 bg-green-500/80 text-white px-6 py-2 rounded-full z-50 shadow-xl backdrop-blur-md"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {!toggleSign && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="bg-[#071f18]/90 backdrop-blur-xl flex flex-col items-center py-8 px-6 sm:px-10 rounded-4xl sm:rounded-[3rem] shadow-2xl border border-white/10 w-[90%] sm:w-auto"
        >
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="rounded-full mb-6 shadow-lg"
          />
          <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>
          <form
            onSubmit={handleSignIn}
            className="flex flex-col items-center gap-4 w-full"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Email"
              value={formDataSignIn.email}
              onChange={handleChangeSignIn}
              className="bg-white/5 w-full sm:w-80 h-12 rounded-full border border-white/10 p-4 outline-none focus:border-white/40 text-white transition-all"
            />
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              value={formDataSignIn.password}
              onChange={handleChangeSignIn}
              className="bg-white/5 w-full sm:w-80 h-12 rounded-full border border-white/10 p-4 outline-none focus:border-white/40 text-white transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-6 mb-4 w-full h-12 bg-white text-[#071f18] font-bold rounded-full hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </motion.button>
          </form>

          <p className="text-sm text-white/50">
            Don't have an account?{" "}
            <span
              className="font-bold underline cursor-pointer text-white"
              onClick={handleToggleSign}
            >
              Sign Up
            </span>
          </p>
        </motion.div>
      )}

      {toggleSign && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[#071f18]/90 backdrop-blur-xl flex flex-col items-center py-8 px-6 sm:px-10 rounded-4xl sm:rounded-[3rem] shadow-2xl border border-white/10 w-[90%] sm:w-auto"
        >
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="rounded-full mb-6 shadow-lg"
          />
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
          <form
            onSubmit={handleSignUp}
            className="flex flex-col items-center gap-4 w-full"
          >
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                onChange={handleChangeSignUp}
                value={formDataSignUp.firstName}
                required
                className="bg-white/5 w-full sm:w-38 h-12 rounded-full border border-white/10 p-4 outline-none focus:border-white/40 text-white transition-all"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                onChange={handleChangeSignUp}
                value={formDataSignUp.lastName}
                required
                className="bg-white/5 w-full sm:w-38 h-12 rounded-full border border-white/10 p-4 outline-none focus:border-white/40 text-white transition-all"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChangeSignUp}
              value={formDataSignUp.email}
              required
              className="bg-white/5 w-full sm:w-80 h-12 rounded-full border border-white/10 p-4 outline-none focus:border-white/40 text-white transition-all"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChangeSignUp}
              value={formDataSignUp.password}
              required
              className="bg-white/5 w-full sm:w-80 h-12 rounded-full border border-white/10 p-4 outline-none focus:border-white/40 text-white transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-6 mb-4 w-full h-12 bg-white text-[#071f18] font-bold rounded-full hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Sign Up"}
            </motion.button>
          </form>

          <p className="text-sm text-white/50">
            Already have an account?{" "}
            <span
              className="font-bold underline cursor-pointer text-white"
              onClick={handleToggleSign}
            >
              Sign In
            </span>
          </p>
        </motion.div>
      )}

      <video
        src="/video/loginBG.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute left-0 top-0 background-video w-full h-screen object-cover -z-20 brightness-[0.4] bg-black"
        preload="auto"
      />
    </main>
  );
}
