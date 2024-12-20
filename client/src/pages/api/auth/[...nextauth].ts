import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        console.log("User",user)
        // Send user details to the backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/v1/signupWithGoogle`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              password: null, // Use null instead of an empty string
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error("Backend signup failed:", error);
          return false; // Prevent sign-in
        }

        return true; // Proceed with sign-in
      } catch (err) {
        console.error("Error during sign-in callback:", err);
        return false;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
