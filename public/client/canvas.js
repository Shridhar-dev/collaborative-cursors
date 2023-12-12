import { socket } from "./cursor.js";
import { currentColor, currentStroke, invalidArea, isDrawing } from "./states.js";
import { dragElement } from "./utils.js";


dragElement(document.getElementById("canvas-container"));


var c = document.getElementsByTagName("canvas")[0];


let ctx = c.getContext("2d");
ctx.lineWidth = currentStroke
ctx.strokeStyle = currentColor;
ctx.lineCap = 'round';
ctx.lineJoin = 'round'
let isMouseDown = false;
let prevX = 0;
let prevY = 0;





ctx.beginPath()
document.getElementById("canvas-container").addEventListener("mousedown",(e)=>{
  if(!isDrawing) return;
  isMouseDown = true;
  prevX = Math.abs(e.offsetX);
  prevY = Math.abs(e.offsetY);
  ctx.beginPath()
  ctx.moveTo(Math.abs(e.offsetX), Math.abs(e.offsetY));
  //drawImage("",Math.abs(e.offsetX), Math.abs(e.offsetY))
})

document.getElementById("canvas-container").addEventListener("mousemove",(e)=>{
  if(isDrawing && isMouseDown && !invalidArea) {
    socket.emit('drawing',[[prevX,prevY],[Math.abs(e.offsetX), Math.abs(e.offsetY)],currentColor, currentStroke]);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentStroke;
    ctx.lineTo(Math.abs(e.offsetX), Math.abs(e.offsetY));
    ctx.stroke()
    prevX = Math.abs(e.offsetX);
    prevY = Math.abs(e.offsetY);
    ctx.moveTo(Math.abs(e.offsetX), Math.abs(e.offsetY));
  }
})

document.getElementById("canvas-container").addEventListener("mouseup",(e)=>{
  if(!isDrawing) return;
  isMouseDown = false
})


socket.on("drew",(data)=>{
  ctx.beginPath()
  ctx.strokeStyle = data[2];
  ctx.lineWidth = data[3];
  ctx.moveTo(data[0][0], data[0][1]);
  ctx.lineTo(data[1][0], data[1][1]);
  ctx.stroke()
})

socket.on("allCursors", (data)=>{
  if(!data[1]) return;
  data[1].forEach(coords => {
    ctx.beginPath()
    ctx.strokeStyle = coords[2];
    ctx.lineWidth = coords[3];
    ctx.moveTo(coords[0][0], coords[0][1]);
    ctx.lineTo(coords[1][0], coords[1][1]);
    ctx.stroke()
  });
})


export { dragElement }