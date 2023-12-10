const drawBtn = document.getElementById("draw-button");
const colorInput = document.getElementById("draw-color");
let currentColor = "#000000"
let isDrawing = false;
drawBtn.addEventListener("click",() => { isDrawing = !isDrawing})
colorInput.addEventListener("input",(e) => { currentColor = e.target.value })

export { isDrawing, currentColor }