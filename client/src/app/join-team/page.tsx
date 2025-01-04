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



export default function JoiningCodeInput() {
  const [joiningCode, setJoiningCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Here you would typically validate the joining code with an API call
      // For this example, we'll simulate an API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate a successful validation
      // onCodeSubmit(joiningCode);
    } catch (err) {
      console.log("Error occured",err)
      setError("Invalid joining code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
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
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
