import express from 'express';
import { Server } from 'socket.io';
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"))

app.use('/', express.static(path.resolve(__dirname, 'assets')));

const server = app.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

const io = new Server(server);


let cursors = {}
let polygons = []

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

    socket.on("drawing",(data)=>{
      polygons.push(data)
      socket.broadcast.emit('drew', data);
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

    

    socket.emit("allCursors", [cursors,polygons])

    socket.on("disconnect", ()=>{
      delete cursors[socket.id];
      socket.broadcast.emit('cursorLeft', socket.id);
    })
});