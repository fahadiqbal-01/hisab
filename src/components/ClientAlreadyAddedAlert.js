"use client";

import { useEffect, useRef } from "react";

export default function ClientAlreadyAddedAlert({ show, t }) {
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (show && !hasShownRef.current) {
      hasShownRef.current = true;
      alert(t ? t.clientAlreadyExists : "Client already added");
    }
  }, [show, t]);

  return null;
}
