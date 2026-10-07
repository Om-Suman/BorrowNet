import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export default function GoogleSignInButton({
  onSuccess,
  onError,
  isLoading = false,
  text = "Continue with Google",
  className = "",
}) {
  const googleButtonRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState("loading");
  const [statusMessage, setStatusMessage] = useState("");

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";
  const isConfigured = Boolean(
    clientId &&
      clientId !== "your-google-oauth-client-id.apps.googleusercontent.com" &&
      clientId.endsWith(".apps.googleusercontent.com"),
  );

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!isConfigured) {
      setStatus("unavailable");
      setStatusMessage("Google sign-in needs VITE_GOOGLE_CLIENT_ID configured.");
      return undefined;
    }

    let attempts = 0;
    let intervalId;
    const initialize = () => {
      const googleIdentity = window.google?.accounts?.id;
      if (!googleIdentity || !googleButtonRef.current) return false;

      googleIdentity.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccessRef.current?.({ credential: response.credential });
            return;
          }
          onErrorRef.current?.(new Error("Google did not return a sign-in credential."));
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      googleButtonRef.current.replaceChildren();
      googleIdentity.renderButton(googleButtonRef.current, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: text.toLowerCase().includes("sign up") ? "signup_with" : "continue_with",
        size: "large",
        logo_alignment: "left",
        width: Math.min(400, Math.max(240, googleButtonRef.current.clientWidth)),
      });
      setStatus("ready");
      setStatusMessage("");
      return true;
    };

    if (!initialize()) {
      intervalId = window.setInterval(() => {
        attempts += 1;
        if (initialize()) {
          window.clearInterval(intervalId);
        } else if (attempts >= 50) {
          window.clearInterval(intervalId);
          setStatus("unavailable");
          setStatusMessage("Google sign-in could not load. Check your connection and refresh.");
        }
      }, 200);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [clientId, isConfigured, text]);

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={googleButtonRef}
        className={`min-h-11 w-full flex justify-center ${status !== "ready" || isLoading ? "invisible h-0 min-h-0 overflow-hidden" : ""}`}
        aria-hidden={status !== "ready" || isLoading}
      />

      {(status !== "ready" || isLoading) && (
        <button
          type="button"
          disabled
          aria-busy={status === "loading" || isLoading}
          className="w-full min-h-11 py-2.5 px-4 rounded-xl bg-[#f2f4ff] dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 text-[#131b2e] dark:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-sm opacity-70"
        >
          {status === "loading" || isLoading ? (
            <Loader2 className="w-4 h-4 text-[#006948] animate-spin shrink-0" />
          ) : (
            <GoogleMark />
          )}
          <span>{isLoading ? "Signing you in…" : text}</span>
        </button>
      )}

      {statusMessage && (
        <p className="mt-2 text-center text-xs text-[#64748b] dark:text-neutral-400" role="status">
          {statusMessage}
        </p>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}
