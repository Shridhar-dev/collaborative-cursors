const drawBtn = document.getElementById("draw-button");
const colorInput = document.getElementById("draw-color");
const toolbar = document.querySelector(".toolbar");

let currentColor = "#000000"
let isDrawing = false;
let invalidArea = false;

drawBtn.addEventListener("click",() => { isDrawing = !isDrawing})
colorInput.addEventListener("input",(e) => { currentColor = e.target.value })

toolbar.addEventListener("mouseenter",()=>{ invalidArea = true })
toolbar.addEventListener("mouseleave",()=>{ invalidArea = false })

export { isDrawing, invalidArea, currentColor }