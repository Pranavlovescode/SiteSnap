'use client'
import React from 'react'
import { useParams } from 'next/navigation'

function WorkerDashboard() {
  const params = useParams<{ team_id: string }>();
  return (
    <div>{params?.team_id}</div>
  )
}

export default WorkerDashboard