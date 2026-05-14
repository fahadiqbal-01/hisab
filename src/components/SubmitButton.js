"use client";
import { useFormStatus } from "react-dom";

export default function SubmitButton({ label = "Save", pendingLabel = "Saving..." }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="select-none cursor-pointer bg-[#071f18] dark:bg-white text-white dark:text-black px-10 py-4 rounded-full font-semibold hover:bg-[#0a2d23] dark:hover:bg-orange-700 dark:hover:text-white transition-all w-full md:w-auto order-1 md:order-0 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              strokeLinecap="round"
            />
          </svg>
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
