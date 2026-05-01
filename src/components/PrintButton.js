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
    const res = await fetch(`/dashboard/invoices/${invoiceId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });

    if (res.ok) {
      setStatus("paid");
      router.refresh();
    }
    setLoading(false);
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
        // AGGRESSIVE FIX: Clean modern CSS colors from the entire cloned document
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.getElementsByTagName("*");
          for (let el of allElements) {
            const style = window.getComputedStyle(el);

            // Check for modern color functions in text color
            if (style.color.includes("okl") || style.color.includes("lab")) {
              el.style.setProperty("color", "#000000", "important");
            }

            // Check for modern color functions in backgrounds
            if (
              style.backgroundColor.includes("okl") ||
              style.backgroundColor.includes("lab")
            ) {
              // If it's a background, usually safer to force white or transparent
              el.style.setProperty(
                "background-color",
                "transparent",
                "important",
              );
            }

            // Check for border colors
            if (
              style.borderColor.includes("okl") ||
              style.borderColor.includes("lab")
            ) {
              el.style.setProperty("border-color", "#e5e7eb", "important");
            }
          }

          // Force the main container to be visible and white
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
    <div className="flex gap-4 print:hidden">
      {status !== "paid" && (
        <button
          onClick={markAsPaid}
          disabled={loading}
          className="border border-[#071f18] text-[#071f18] px-8 py-3 rounded-full font-semibold hover:bg-[#071f18] hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? "Updating..." : "Mark as Paid"}
        </button>
      )}
      <button
        onClick={handleDownloadPDF}
        disabled={isDownloading}
        className="bg-[#071f18] text-white px-8 py-3 rounded-full font-semibold hover:bg-black transition-all disabled:opacity-50"
      >
        {isDownloading ? "Generating PDF..." : "Download PDF"}
      </button>
    </div>
  );
}
