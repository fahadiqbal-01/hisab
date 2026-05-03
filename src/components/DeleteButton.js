"use client";
import { useState } from "react";
import { deleteInvoice } from "@/app/actions/invoices";

export default function DeleteButton({ id, label = "Delete" }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteInvoice(id);
    setIsConfirming(false);
    setIsDeleting(false);
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
        <span className="text-[10px] font-bold uppercase text-red-500">
          Are you sure?
        </span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-[10px] font-bold uppercase underline text-red-600 hover:text-red-700 cursor-pointer "
        >
          {isDeleting ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          className="text-[10px] font-bold uppercase underline text-black/40 dark:text-white cursor-pointer"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="text-black/30 dark:text-white/70 hover:text-red-500 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    </button>
  );
}
