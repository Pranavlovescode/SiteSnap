import React from "react";
import DashboardLayout from "@/pages/Dashboard";
import { cookies } from "next/headers";

export default async function Dashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = (await cookies()).getAll();
  console.log("first cookie", cookie);
  return (
    <>
      <DashboardLayout children={children} />      
    </>
  );
}
