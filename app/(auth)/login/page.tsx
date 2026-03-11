import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "./sign-in-button";

export const metadata = {
  title: "Sign In — AUHMS",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // Already authenticated — go straight to the dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400, padding: "2rem" }}>
        <h1>Averett University</h1>
        <h2>Housing Management System</h2>
        <p style={{ color: "#666", marginBottom: "2rem" }}>
          Sign in with your Averett Microsoft account to continue.
        </p>
        <SignInButton />
        <p style={{ fontSize: "0.875rem", color: "#999", marginTop: "1.5rem" }}>
          Use your @averett.edu credentials. Contact Housing or IT if you need
          access.
        </p>
      </div>
    </main>
  );
}
