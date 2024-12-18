import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import router from './routes/api/v1/auth.js';
import cors from 'cors'
import http from 'http'
import cookieParser from 'cookie-parser'
import setUpWebSocket from './websocket.js';

const app = express();
const server = http.createServer(app);





// io.on("connection",(socket)=>{
//     console.log("User is connected with id :",socket.id)
// })

app.use(cors())
app.use(express.json())
app.use(cookieParser())
// app.use(session({
//     secret:process.env.SESSION_SECRET || "qljfe9KrD9HF3i+9b3B5xpdErJJbUF+rw9vgUoO61rg=",
//     resave:false,
//     saveUninitialized:true,
//     cookie:{maxAge:60*60*1000}
// }))

app.use('/api/v1/',router)
setUpWebSocket(server)

server.listen(5000,()=>{
    console.log("Server is running !!")
})