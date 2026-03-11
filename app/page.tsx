import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Root page — redirect authenticated users to the dashboard,
// unauthenticated users to the login page.
export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    // (dashboard) is a route group — it has no URL segment.
    // /buildings is the first dashboard page.
    redirect("/buildings");
  } else {
    redirect("/login");
  }
}
