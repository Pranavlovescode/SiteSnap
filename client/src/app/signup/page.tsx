import SignUpForm from "@/pages/Signup";
import React from "react";

function SignUp() {
  return (
    <main className="min-h-screen bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070')] bg-cover bg-center">
      <div className="min-h-screen bg-black/50 flex items-center justify-center p-4">
        {/* <LoginForm /> */}
        <SignUpForm/>
      </div>
    </main>
  );
}

export default SignUp;
