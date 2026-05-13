"use client";

import { useEffect, useRef } from "react";

export default function ClientAlreadyAddedAlert({ show }) {
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (show && !hasShownRef.current) {
      hasShownRef.current = true;
      alert("Client already added");
    }
  }, [show]);

  return null;
}
