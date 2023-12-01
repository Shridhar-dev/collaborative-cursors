import express from 'express';
import { Server } from 'socket.io';


const app = express();
app.use(express.urlencoded({ extended: false }));
//app.use(express.static("public"))


const server = app.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

const io = new Server(server);


let cursors = {}

io.on('connection', (socket) => {
    socket.join('local');

    cursors[socket.id] = {
      x:10,
      y:10,
      name:"user"
    }

    socket.broadcast.emit('cursorJoined', socket.id);

    socket.on("cursorMoved",(data)=>{
        io.emit('cursorPositionUpdate', data);
        cursors[socket.id] = {
          ...cursors[socket.id], 
          x:data.x,
          y:data.y
        }
    })

    socket.on("cursorNameChange",(name)=>{
      io.emit('cursorNameChanged', {
        ...cursors[socket.id], 
        id:socket.id,
        name
      });
      cursors[socket.id] = {
        ...cursors[socket.id], 
        name
      }
    })

    socket.emit("allCursors", cursors)

    socket.on("disconnect", ()=>{
      delete cursors[socket.id];
      socket.broadcast.emit('cursorLeft', socket.id);
    })
});