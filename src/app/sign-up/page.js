"use client";
import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "@/lib/translations";

export default function SignUp() {
  const router = useRouter();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )lang=([^;]*)/);
    if (match) {
      setLang(match[1]);
    }
  }, []);

  const t = getTranslations(lang);

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
        setSuccess(t.accountCreatedSuccess);
        setToggleSign(false);
        setFormDataSignUp({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
      } else {
        const errorData = await res.json();
        setError(errorData.message || t.registrationFailed);
      }
    } catch (err) {
      setError(t.somethingWentWrong);
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
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(t.invalidCredentials);
        setLoading(false);
      }
    } catch (err) {
      setError(t.unexpectedError);
      setLoading(false);
    }
  };

  return (
    <main
      id="banner"
      className="w-full h-screen flex justify-center items-center select-none relative"
    >
      {/* Premium Language Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => {
            const nextLang = lang === "en" ? "bn" : "en";
            setLang(nextLang);
            document.cookie = `lang=${nextLang}; path=/; max-age=31536000; SameSite=Lax`;
          }}
          className="cursor-pointer select-none px-4 py-2 rounded-full bg-[#082019]/60 hover:bg-[#082019]/80 text-white border border-white/10 shadow-sm transition-all text-xs font-bold uppercase tracking-wider active:scale-95"
        >
          {lang === "en" ? "বাংলা" : "English"}
        </button>
      </div>

      {error && (
        <div className="absolute top-10 bg-red-500/80 text-white px-6 py-2 rounded-full z-50 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="absolute top-10 bg-[#ffffff] text-green-800 font-bold px-6 py-2 rounded-full z-50 text-sm">
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
          className="flex flex-col items-center gap-4 w-full sm:w-fit z-50 sm:p-10 pt-5 animate-none"
        >
          <input
            type="email"
            name="email"
            required
            placeholder={t.emailAddress}
            value={formDataSignIn.email}
            onChange={handleChangeSignIn}
            className="bg-transparent w-full sm:w-80 h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
          />
          <input
            type="password"
            name="password"
            required
            placeholder={t.password}
            value={formDataSignIn.password}
            onChange={handleChangeSignIn}
            className="bg-transparent w-full sm:w-80 h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-6 mb-4 px-8 py-2 bg-white text-black font-semibold rounded-full select-none cursor-pointer hover:bg-gray-200 transition-all active:scale-95 duration-150 disabled:opacity-50 text-xs font-bold uppercase tracking-wider shadow-md"
          >
            {loading ? t.signingIn : t.signIn}
          </button>
        </form>

        <p className="text-xs select-none text-white/70">
          {t.dontHaveAccount}ㅤ
          <span
            className="font-bold underline cursor-pointer text-white hover:text-green-300 transition-colors"
            onClick={handleToggleSign}
          >
            {t.signUp}
          </span>
        </p>
      </div>

      {/* SIGN UP FORM */}
      <div
        className={`${toggleSign ? "bg-[#071f18] dark:bg-[#0d0d0d] flex flex-col items-center py-8 px-4 h-screen md:h-auto w-full sm:w-auto" : "hidden"} z-50 `}
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
          className="flex flex-col items-center gap-5 w-full sm:w-fit z-50 sm:p-10 pt-0 animate-none"
        >
          <div className="flex flex-col justify-center items-center gap-6">
            <div className=" flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-2 w-full">
              <input
                type="text"
                name="firstName"
                placeholder={t.firstName}
                onChange={handleChangeSignUp}
                value={formDataSignUp.firstName}
                required
                className="bg-transparent w-full sm:w-42 h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
              />
              <input
                type="text"
                name="lastName"
                placeholder={t.lastName}
                onChange={handleChangeSignUp}
                value={formDataSignUp.lastName}
                required
                className="bg-transparent w-full sm:w-42 h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder={t.emailAddress}
              onChange={handleChangeSignUp}
              value={formDataSignUp.email}
              required
              className="bg-transparent w-full h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
            />
            <input
              type="password"
              name="password"
              placeholder={t.password}
              onChange={handleChangeSignUp}
              value={formDataSignUp.password}
              required
              className="bg-transparent w-full h-10 rounded-full outline-2 outline-white/50 p-3 focus:outline-white text-md text-white/50 focus-within:text-white font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 mb-4 px-8 py-2 bg-white text-black font-semibold rounded-full select-none cursor-pointer hover:bg-gray-200 transition-all active:scale-95 duration-150 disabled:opacity-50 text-xs font-bold uppercase tracking-wider shadow-md"
          >
            {loading ? t.creatingClientBtn : t.signUp}
          </button>
        </form>

        <p className="text-xs select-none text-white/70">
          {t.alreadyHaveAccount}ㅤ
          <span
            className="font-bold underline cursor-pointer text-white hover:text-green-300 transition-colors"
            onClick={handleToggleSign}
          >
            {t.signIn}
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
