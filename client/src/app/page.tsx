"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import {io} from 'socket.io-client'

type message={
  message:string
}

const socket = io('http://localhost:5000')
export default function Home() {
  const [message,setMessage] = useState({
    message:''
  })
  useEffect(()=>{
    socket.on('connect',()=>{
      console.log('connected to server')
    })

    socket.on('message',(msg)=>{
      console.log(msg)
    })
    
  })

  const sendMessage = ()=>{
    socket.emit('message',message.message)
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <input type="text" name="msg" id=""  onChange={(e)=>setMessage({ ...message ,message: e.target.value })}/>
      <button className="bg-gray-300" onClick={sendMessage}>Send Message</button>
    </div>
  );
}
