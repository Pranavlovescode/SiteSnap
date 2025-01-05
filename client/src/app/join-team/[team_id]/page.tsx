"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from "axios";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";



export default function JoiningCodeInput() {

  const params = useParams<{team_id:string}>()
  const [joiningCode, setJoiningCode] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Here you would typically validate the joining code with an API call
      // For this example, we'll simulate an API call with a timeout
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // Simulate a successful validation
      // onCodeSubmit(joiningCode);

      const joiningCodeResponse = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND}/api/v1/update/team/members`,{
        members:[email]
      },{
        headers:{
          'Content-Type':'application/json'
        },
        withCredentials:true,
        params:{
          team_id:params?.team_id,
          code:joiningCode
        }
      })
      const response = joiningCodeResponse.status
      if (response==200) {
        console.log("joincode response",joiningCodeResponse.data)
        toast.success("You are added to the team")
      }
      // else if(response==400){
      //   setError("Invalid joining code. Please try again.");
      //   toast.error("Invalid code. Please enter a valid code")
      // }
      else{
        setError("Something went wrong");
        toast.error("Some error occured. Please try again later")
      }

    } catch (err) {
      console.log("Error occured",err) 
      setError((err as any).response?.data?.error || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
        {error && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          <Card>
            <CardHeader>
              <CardTitle>Join Team</CardTitle>
              <CardDescription>
                Enter the joining code to request access to the team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joiningCode">Joining Code</Label>
                    <Input
                      id="joiningCode"
                      placeholder="Enter the team joining code"
                      value={joiningCode}
                      onChange={(e) => setJoiningCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Submit Joining Code"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
