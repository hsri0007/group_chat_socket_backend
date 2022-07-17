const express = require("express");
const http = require("http");
const app = express();
const cors = require('cors')
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, {
  cors: {
    origin: ["http://localhost:3000","https://www.codisfaction.com"],
    methods: ["GET", "POST"],
    allowedHeaders: ["content-type"],
  },
});

let users=[]

const messages={
  jokes:[],
  general:[]
}
app.use(cors())

app.get("/",(req,res)=>{
  res.json({
    success:true
  })
})

io.on("connection", socket => {

  socket.on('join server',(username)=>{
    const user={
      username,
      id:socket.id
    }
    users.push(user);
    io.emit("new user",users)
  })
  socket.on('join room',(roomName,cd)=>{
     socket.join(roomName)
    cd(messages[roomName])
  })
  socket.on('send message',({content,to,sender,chatName,isChannel})=>{
   if(isChannel){
    const payload={
      content,
      chatName,
      sender
    }
   socket.to(to).emit("new message",payload)
   }else{
    const payload={
      content,
      chatName:sender,
      sender
    }
   socket.to(to).emit("new message",payload)
   }
   
   if(messages[chatName]){
    messages[chatName].push({
      sender,
      content
    })
   }

  })

  socket.on("disconnect",()=>{
    users=users.filter(u=>u.id !== socket.id);
    io.emit("new user",users)
  })

})


const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Server running on port ${port}`));