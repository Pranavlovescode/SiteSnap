"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // .regex(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  //   "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  // ),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    // e.preventDefault()
    setIsLoading(true);
    // Simulate API call
    try {
      const loginResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/v1/login`,
        {
          email: values.email,
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = loginResponse.data;
      console.log("The login response is: ", data);
      if (loginResponse.status === 200) {
        toast.success("You have successfully logged in.");
        setIsLoading(false);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        navigate.push("/protected");
        values.email = "";
        values.password = "";
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again later.");
    }
  }

  const signUpWithGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Redirecting...");

    // const popup = window.open(
    //   "http://localhost:5000/api/v1/login/google",
    //   "_blank",
    //   "width=500,height=600"
    // );

    // const popupInterval = setInterval(() => {
    //   if (!popup || popup.closed) {
    //     clearInterval(popupInterval);
    //     console.log("Popup closed by user");
    //   }
    // }, 500);

    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND}/api/v1/login/google`;
  };

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-white/30 dark:bg-black/30 border-0">
      <CardHeader className="space-y-2">
        <CardTitle className="text-3xl font-bold text-center">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center text-gray-800">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                      className="bg-white/30 dark:bg-black/30 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                      className="bg-white/30 dark:bg-black/30 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-gray-800">
          <a href="#" className="underline underline-offset-4">
            Forgot your password?
          </a>
        </div>
        <div className="text-sm text-center text-gray-800">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="hover:text-primary underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
        <div className="flex flex-row items-center space-x-4 justify-center">
          <Separator className="bg-gray-900" />
          <span className="text-gray-900">or</span>
          <Separator className="bg-gray-900" />
        </div>
        <div className="md:w-1/2">
          <Button onClick={signUpWithGoogle} className="w-full">
            <Image
              src={
                "https://cloudinary-res.cloudinary.com/image/upload/v1645708175/sign_up/cdnlogo.com_google-icon.svg"
              }
              height={23}
              width={23}
              alt="Google logo"
            />{" "}
            Sign In with Google
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
