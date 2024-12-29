import React from 'react'
import DashboardLayout from '@/pages/Dashboard'
import TeamManagement from '@/pages/TeamManagement'
import { cookies } from 'next/headers'

export default async function Dashboard() {
  const cookie = (await cookies()).getAll()
  console.log("first cookie", cookie)
  return (
    <DashboardLayout>
      <TeamManagement cookie={cookie} />
    </DashboardLayout>
  )
}
