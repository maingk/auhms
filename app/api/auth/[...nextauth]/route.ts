import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth.js App Router handler.
// Handles all /api/auth/* routes: signin, signout, session, callbacks.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
