  "use client";

  import { useState } from "react";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useForm } from "react-hook-form";
  import * as z from "zod";
  import { Loader2 } from "lucide-react";

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

  const loginSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    //   "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    // ),
  });

  export default function SignUpForm() {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        name:"",
        email: "",
        password: "",
      },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
      // e.preventDefault()
      setIsLoading(true);
      // Simulate API call
      try {
        const signupResponse = await axios.post(
          "/api/auth/signup",  // Make sure this is a valid string (URL)
          {  
            name: values.name,
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
        const data = signupResponse.data;
        console.log("The login response is: ", data);
        if (signupResponse.status === 201) {
          toast.success("You have successfully signed up.");
          setIsLoading(false);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          values.name = "";
          values.email = "";
          values.password = "";
        } else {
          toast.error("Some error occuerd. Please try again.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Some error occuerd. Please try again.");
      }
    }

    return (
      <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-white/30 dark:bg-black/30 border-0">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-center">
            Sign Up
          </CardTitle>
          <CardDescription className="text-center text-gray-800">
            Enter your credentials to be part of our community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        type="text"
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
                    Signing up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {/* <div className="text-sm text-center text-gray-800">
            <a href="#" className="underline underline-offset-4">
              Forgot your password?
            </a>
          </div> */}
          <div className="text-sm text-center text-gray-800">
            Already have an account?{" "}
            <Link
              href="/"
              className="hover:text-primary underline underline-offset-4"
            >
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    );
  }
