import express from 'express';
import { Server } from 'socket.io';
import path from 'path'
import { fileURLToPath } from 'url';
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"))


const server = app.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

const io = new Server(server);


let cursors = {}
let polygons = {}
let gifs = {}


/*
  make a gif object
  each gif has unique id
  it has url, x and y

  whenever moved, the x and y change, so we send id, x and y from client

  gifs
    - room id
        - gif1
        - gif2
*/

io.on('connection', (socket) => {
 
    socket.join("r"+socket.id);

    cursors[socket.id] = {
      x:10,
      y:10,
      name:"user",
      currentRoom:"r"+socket.id
    }
    polygons[cursors[socket.id].currentRoom] = [
      ...(polygons[cursors[socket.id].currentRoom] ? polygons[cursors[socket.id].currentRoom]
      :
      [] 
      )]

      gifs[cursors[socket.id].currentRoom] = {
        ...(gifs[cursors[socket.id].currentRoom] ? gifs[cursors[socket.id].currentRoom]
        :
        {} 
        )}
      
    socket.broadcast.to(cursors[socket.id].currentRoom).emit('cursorJoined', socket.id);

    socket.on("cursorMoved",(data)=>{
        io.to(cursors[socket.id].currentRoom).emit('cursorPositionUpdate', data);
        cursors[socket.id] = {
          ...cursors[socket.id], 
          x:data.x,
          y:data.y
        }
    })

    socket.on("gifAdded",(data)=>{
      gifs[cursors[socket.id].currentRoom][data.id] = {
        url:data.url,
        x:data.x,
        y:data.y
      }
      
      socket.broadcast.to(cursors[socket.id].currentRoom).emit('gifAddedToDOM', data);
    })

    socket.on("gifMoved",(data)=>{
      gifs[cursors[socket.id].currentRoom][data.id] = {
        ...gifs[cursors[socket.id].currentRoom][data.id],
        x:data.x,
        y:data.y
      }
      socket.broadcast.to(cursors[socket.id].currentRoom).emit('gifMovedToDOM', data);

    })

    socket.on("drawing",(data)=>{
      polygons[cursors[socket.id].currentRoom] = [
        ...(polygons[cursors[socket.id].currentRoom] ? polygons[cursors[socket.id].currentRoom]
        :
        [] 
        )]
      polygons[cursors[socket.id].currentRoom].push(data);

      socket.broadcast.in(cursors[socket.id].currentRoom).emit('drew', data);
    })

    socket.on("cursorNameChange",(name)=>{
      io.to(cursors[socket.id].currentRoom).emit('cursorNameChanged', {
        ...cursors[socket.id], 
        id:socket.id,
        name
      });
      cursors[socket.id] = {
        ...cursors[socket.id], 
        name
      }
    })
    socket.emit("key",process.env.TENOR_API_KEY)
    socket.to(cursors[socket.id].currentRoom).emit("allCursors", [cursors,polygons[cursors[socket.id].currentRoom],gifs[cursors[socket.id].currentRoom]])

    socket.on("joinRoom",(id)=>{
      socket.broadcast.to(cursors[socket.id].currentRoom).emit('cursorLeft', socket.id);
      socket.leave(cursors[socket.id].currentRoom);
      cursors[socket.id].currentRoom = "r"+id
      socket.join("r"+id);
      socket.emit("allCursors", [cursors,polygons[cursors[socket.id].currentRoom], gifs[cursors[socket.id].currentRoom]]);
      socket.broadcast.to(cursors[socket.id].currentRoom).emit('cursorJoined', socket.id);
    })

    socket.on("disconnect", ()=>{
      socket.broadcast.to(cursors[socket.id].currentRoom).emit('cursorLeft', socket.id);
      delete cursors[socket.id];
    })
});