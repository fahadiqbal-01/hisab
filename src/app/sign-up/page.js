"use client";
import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignUp() {
  const router = useRouter();
  const [toggleSign, setToggleSign] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefetch the dashboard route to speed up the transition after login
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

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

    try {
      const res = await signIn("credentials", {
        email: formDataSignIn.email,
        password: formDataSignIn.password,
        redirect: false,
      });

      if (res?.ok) {
        window.location.href = "/dashboard";
      } else {
        setError("Invalid email or password");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main
      id="banner"
      className="w-full h-screen flex justify-center items-center select-none relative"
    >
      {error && (
        <div className="absolute top-10 bg-red-500/80 text-white px-6 py-2 rounded-full z-50">
          {error}
        </div>
      )}

      {success && (
        <div className="absolute top-10 bg-green-500/80 text-white px-6 py-2 rounded-full z-50">
          {success}
        </div>
      )}
      {/* SIGN IN FORM */}
      <div
        className={`${toggleSign ? "hidden" : "bg-[#071f18] dark:bg-[#0d0d0d] flex flex-col justify-center items-center py-8 px-4 h-screen md:h-auto w-full sm:w-auto"} z-50 `}
      >
        <Image
          src="/images/logothird.png"
          alt="Logo"
          width={80}
          height={80}
          className="my-5 mx-auto"
        />
        <form
          onSubmit={handleSignIn}
          className="flex flex-col items-center gap-4 w-full sm:w-fit z-50 sm:p-10 pt-5"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            value={formDataSignIn.email}
            onChange={handleChangeSignIn}
            className="bg-transparent w-full sm:w-80 h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            value={formDataSignIn.password}
            onChange={handleChangeSignIn}
            className="bg-transparent w-full sm:w-80 h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-6 mb-4 px-6 py-1 bg-white text-black font-semibold rounded-full select-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm select-none text-white/70">
          Don't have an account?ㅤ
          <span
            className="font-bold underline cursor-pointer text-white"
            onClick={handleToggleSign}
          >
            Sign Up
          </span>
        </p>
      </div>

      {/* SIGN UP FORM */}
      <div
        className={`${toggleSign ? "bg-[#071f18] dark:bg-[#0d0d0d] flex flex-col items-center py-8 px-4 w-full sm:w-auto" : "hidden"} z-50 `}
      >
        <Image
          src="/images/logothird.png"
          alt="Logo"
          width={80}
          height={80}
          className="my-5 mx-auto"
        />
        <form
          onSubmit={handleSignUp}
          className="flex flex-col items-center gap-5 w-full sm:w-fit z-50 sm:p-10 pt-0"
        >
          <div className="flex flex-col justify-center items-center gap-6">
            <div className=" flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-2 w-full">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                onChange={handleChangeSignUp}
                value={formDataSignUp.firstName}
                required
                className="bg-transparent w-full sm:w-42 h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                onChange={handleChangeSignUp}
                value={formDataSignUp.lastName}
                required
                className="bg-transparent w-full sm:w-42 h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChangeSignUp}
              value={formDataSignUp.email}
              required
              className="bg-transparent w-full h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChangeSignUp}
              value={formDataSignUp.password}
              required
              className="bg-transparent w-full h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 mb-4 px-6 py-1 bg-white text-black font-semibold rounded-full select-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm select-none text-white/70">
          Already have an account?ㅤ
          <span
            className="font-bold underline cursor-pointer text-white"
            onClick={handleToggleSign}
          >
            Sign In
          </span>
        </p>
      </div>

      <Image
        src="/images/banner.jpg"
        alt="Background banner"
        fill
        priority
        className="absolute left-0 top-0 -z-20 object-cover opacity-60"
      />
    </main>
  );
}
