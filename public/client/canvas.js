import { currentColor, isDrawing } from "./states.js";
const socket = io();

dragElement(document.getElementById("canvas-container"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  elmnt.onmousedown = dragMouseDown;
  

  function dragMouseDown(e) {
    if(isDrawing) return;
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

var c = document.getElementsByTagName("canvas")[0];


let ctx = c.getContext("2d");
ctx.lineWidth = 3
ctx.strokeStyle = currentColor;
let isMouseDown = false;
let prevX = 0;
let prevY = 0;
document.getElementById("canvas-container").addEventListener("mousedown",(e)=>{
  if(!isDrawing) return;
  isMouseDown = true;
  ctx.beginPath()
  prevX = Math.abs(e.offsetX);
  prevY = Math.abs(e.offsetY);
  ctx.moveTo(Math.abs(e.offsetX), Math.abs(e.offsetY));
})

document.getElementById("canvas-container").addEventListener("mousemove",(e)=>{
  if(isDrawing && isMouseDown) {
    socket.emit('drawing',[[prevX,prevY],[Math.abs(e.offsetX), Math.abs(e.offsetY)],currentColor]);
    ctx.strokeStyle = currentColor;
    ctx.lineTo(Math.abs(e.offsetX), Math.abs(e.offsetY));
    ctx.stroke()
    prevX = Math.abs(e.offsetX);
    prevY = Math.abs(e.offsetY);
    ctx.moveTo(Math.abs(e.offsetX), Math.abs(e.offsetY));
  }
})

document.getElementById("canvas-container").addEventListener("mouseup",(e)=>{
  if(!isDrawing) return;
  ctx.closePath()
  isMouseDown = false
})


socket.on("drew",(data)=>{
  ctx.beginPath()
  ctx.strokeStyle = data[2];
  ctx.moveTo(data[0][0], data[0][1]);
  ctx.lineTo(data[1][0], data[1][1]);
  ctx.stroke()
})

socket.on("allCursors", (data)=>{
  data[1].forEach(coords => {
    ctx.beginPath()
    ctx.strokeStyle = coords[2];
    ctx.moveTo(coords[0][0], coords[0][1]);
    ctx.lineTo(coords[1][0], coords[1][1]);
    ctx.stroke()
  });
})