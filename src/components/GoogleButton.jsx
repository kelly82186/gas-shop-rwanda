import { useEffect, useRef, useState } from "react";
import api from "../api";

function GoogleButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            const response = await api.post("/auth/google", { credential });
            onSuccess(response.data.user);
          } catch {
            onError("Google sign-in failed. Please try again.");
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, { theme: "outline", size: "large", width: 360, text: "continue_with" });
      setReady(true);
    };

    if (window.google) {
      renderButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    document.head.appendChild(script);
    return () => script.remove();
  }, [clientId, onError, onSuccess]);

  if (!clientId) {
    return <button type="button" onClick={() => onError("Google sign-in requires OAuth configuration.")} className="w-full rounded border border-gray-300 px-4 py-3 font-bold text-gray-700 hover:bg-gray-50">Continue with Google</button>;
  }

  return <div ref={buttonRef} className={`flex justify-center ${ready ? "" : "min-h-10"}`} />;
}

export default GoogleButton;