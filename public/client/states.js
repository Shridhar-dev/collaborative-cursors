const drawBtn = document.getElementById("draw-button");
let isDrawing = false;
drawBtn.addEventListener("click",() => { isDrawing = !isDrawing})

export { isDrawing }