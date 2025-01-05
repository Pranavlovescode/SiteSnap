'use client'
import { useParams } from 'next/navigation'
import React from 'react'

function page() {
  const params = useParams<{team_id:string}>();
  return (
    <div>{params?.team_id}</div>
  )
}

export default page