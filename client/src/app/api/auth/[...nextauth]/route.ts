import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import NextAuth, { getServerSession } from "next-auth/next";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { redirect} from "next/navigation";


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

        const passwordMatch = await compare(
          credentials.password,
          user.password
        );

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
    strategy: "jwt", // Using JWT for compatibility with CredentialsProvider
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
        
        // Verify this user still exists and is valid
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
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string },
          });

          // If user doesn't exist, create a new one
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email as string,
                name: user.name as string,
                image: user.image as string,
                // You might want to add emailVerified for Google users
                emailVerified: new Date(),
              },
            });
          }
        } catch (error) {
          console.error("Error in Google sign-in:", error);
          // Continue sign-in process even if there's an error
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/",
    // signOut: '/auth/signout',
    // error: '/auth/error',
  },
  debug: process.env.NODE_ENV === "development",
};

export async function loginIsRequiredServer(){
  const session = await getServerSession(authOptions);
  if (!session) return redirect('/')
}

// export async function loginIsRequiredClient(){
//   if (typeof window === 'undefined') {
//     const session = useSession();
//     const router = useRouter();
//     if (!session) return router.push('/');
//   }

// }

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };