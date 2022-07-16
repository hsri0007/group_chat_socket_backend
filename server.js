const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server,{
  cors:["http://localhost:3000"]
});

let users=[]

const messages={
  jokes:[],
  general:[]
}

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


server.listen(8000, () => console.log("server is running on port 8000"));