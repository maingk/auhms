"use client";

import { signIn } from "next-auth/react";

// Client component — signIn() from next-auth/react requires a client context.
export function SignInButton() {
  return (
    <button
      onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
      style={{
        padding: "0.75rem 2rem",
        fontSize: "1rem",
        cursor: "pointer",
        backgroundColor: "#0078d4", // Microsoft blue
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        width: "100%",
      }}
    >
      Sign in with Microsoft
    </button>
  );
}
