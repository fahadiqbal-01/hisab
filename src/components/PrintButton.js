"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function PrintButton({ invoiceId, initialStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const markAsPaid = async () => {
    setLoading(true);
    const previousStatus = status;
    setStatus("paid");

    try {
      const res = await fetch(`/dashboard/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });

      if (!res.ok) {
        setStatus(previousStatus);
        alert("Failed to update status");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Update failed:", error);
      setStatus(previousStatus);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("invoice-capture-area");
    if (!element) {
      alert("Invoice preview not found. Please refresh the page.");
      return;
    }

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.getElementsByTagName("*");
          for (let el of allElements) {
            const style = window.getComputedStyle(el);

            if (style.color.includes("okl") || style.color.includes("lab")) {
              el.style.setProperty("color", "#000000", "important");
            }

            if (
              style.backgroundColor.includes("okl") ||
              style.backgroundColor.includes("lab")
            ) {
              el.style.setProperty(
                "background-color",
                "transparent",
                "important",
              );
            }

            if (
              style.borderColor.includes("okl") ||
              style.borderColor.includes("lab")
            ) {
              el.style.setProperty("border-color", "#e5e7eb", "important");
            }
          }

          const target = clonedDoc.getElementById("invoice-capture-area");
          if (target) {
            target.style.setProperty(
              "background-color",
              "#ffffff",
              "important",
            );
            target.style.setProperty("color", "#000000", "important");
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${invoiceId.slice(0, 5)}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
      alert(
        "PDF generation failed. Please check the console for the specific error.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="select-none cursor-pointer flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto print:hidden">
      {status !== "paid" && (
        <button
          onClick={markAsPaid}
          disabled={loading}
          className="w-full sm:w-auto border-2 border-[#071f18] dark:border-orange-700 text-[#071f18] dark:text-orange-700 px-8 py-3.5 
                 rounded-xl text-[11px] font-bold uppercase tracking-widest 
                 hover:bg-[#071f18] dark:hover:bg-orange-700 hover:text-white transition-all 
                 disabled:opacity-50 text-center whitespace-nowrap cursor-pointer "
        >
          {loading ? "Updating..." : "Mark as Paid"}
        </button>
      )}

      <button
        onClick={handleDownloadPDF}
        disabled={isDownloading}
        className="select-none cursor-pointer w-full sm:w-auto bg-[#071f18] dark:bg-blue-700 text-white dark:text-white px-8 py-3.5 
               rounded-xl text-[11px] font-bold uppercase tracking-widest 
               hover:bg-black transition-all disabled:opacity-50 
               shadow-lg shadow-black/5 text-center whitespace-nowrap"
      >
        {isDownloading ? "Generating..." : "Download PDF"}
      </button>
    </div>
  );
}
