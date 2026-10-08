import { useEffect, useRef, useState } from 'react';import { AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { googleAuth } from "../../services/loginAPI";
import { useAuth } from "../../context/authValue";

/**
 * "or" divider + Google button + the whole Google flow.
 * Used by Login (mode="login") and Register (mode="register").
 *
 * - AUTHENTICATED -> same path as password login: authLogin(data) -> /dashboard
 * - PENDING       -> onPending(data, message, credential); the host page decides how to show it
 *                   (Register uses the credential to let the user create a password)
 * - rejection     -> message from the backend, shown inline
 *
 * Domain / role / status rules live in the backend. Nothing here is trusted.
 */

const GSI_SRC = "https://accounts.google.com/gsi/client";
let gsiPromise = null;

const loadGsi = () => {
  if (window.google?.accounts?.id) return Promise.resolve();

  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => {
        gsiPromise = null;
        reject(new Error("Failed to load Google script"));
      };
      document.head.appendChild(script);
    });
  }

  return gsiPromise;
};

const GoogleAuthSection = ({ mode = "login", onPending }) => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const buttonRef = useRef(null);
  const handlerRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(() =>
    import.meta.env.VITE_GOOGLE_CLIENT_ID
      ? ""
      : "Google sign-in is not available right now."
  );

  const handleCredential = async (credential) => {
    if (busy) return;

    try {
      setBusy(true);
      setError("");

      const response = await googleAuth(credential, mode);
      const body = response?.data;
      const data = body?.data;

      if (data?.status === "AUTHENTICATED" && data.accessToken) {
        await authLogin(data);
        toast.success("Login successful");
        navigate("/dashboard", { replace: true });
        return;
      }

      if (data?.status === "PENDING") {
        onPending?.(data, body?.message, credential);
        return;
      }

      throw new Error("Unexpected response");
    } catch (err) {
      setError(
        err?.response?.status === 429
          ? "Too many attempts. Please try again in a few minutes."
          : err?.response?.data?.message ||
              "Unable to continue with Google. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  // GIS keeps the first callback it was given, so always call the latest one.
  useEffect(() => {
    handlerRef.current = handleCredential;
  });

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      return undefined;
    }

    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => res?.credential && handlerRef.current(res.credential),
        });

        const width = Math.min(
          400,
          Math.max(200, buttonRef.current.offsetWidth || 400)
        );

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: mode === "register" ? "signup_with" : "continue_with",
          logo_alignment: "center",
          width,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load Google sign-in. Please check your connection.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <div>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          or
        </span>
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <div className="relative">
        <div
          ref={buttonRef}
          className={`flex min-h-[44px] w-full justify-center ${
            busy ? "pointer-events-none opacity-50" : ""
          }`}
        />

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-primary-700" />
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthSection;