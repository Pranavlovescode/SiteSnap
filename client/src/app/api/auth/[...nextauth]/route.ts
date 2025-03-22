import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import NextAuth, { getServerSession } from "next-auth/next";
import { PrismaAdapter } from "@auth/prisma-adapter";

// Extend the Profile type to include email_verified
declare module "next-auth" {
  interface Profile {
    email_verified?: boolean;
  }
}
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

// Define any additional types needed
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await compare(credentials.password, user.password);
        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        const userExists = await prisma.user.findUnique({
          where: { id: session.user.id },
        });

        if (!userExists) {
          throw new Error("User not found");
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          if (!profile?.email_verified) {
            console.log("Google email not verified");
            return false; // Block sign-in if email is not verified
          }

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email as string,
                name: user.name as string,
                image: user.image as string,
                emailVerified: new Date(),
              },
            });
          } else {
            // If user exists but has no Google provider linked, link it
            const accountExists = await prisma.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: "google",
              },
            });

            if (!accountExists) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  provider: "google",
                  type: "oauth",
                  providerAccountId: account?.providerAccountId!,
                },
              });
            }
          }

          return true;
        } catch (error) {
          console.error("Error in Google sign-in:", error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/",
  },
  debug: process.env.NODE_ENV === "development",
};

export async function loginIsRequiredServer() {
  const session = await getServerSession(authOptions);
  if (!session) return redirect('/');
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
