import { socket } from "./cursor.js";
import { dragElement } from "./utils.js";

const drawBtn = document.getElementById("draw-button");
const colorInput = document.getElementById("draw-color");
const strokeInput = document.getElementById("stroke-width");
const gifBtn = document.getElementById("gif-button");
const gifSearch = document.getElementById("gif-search");
const gifInput = document.getElementById("gif-input");
const toolbar = document.querySelector(".toolbar");

let currentColor = "#000000"
let currentStroke = 1;
let isDrawing = false;
let invalidArea = false;
let preventDrag = false;
let apiKey = "";
strokeInput.value = 1;

gifBtn.addEventListener("click",() => { 
    gifSearch.style.visibility = getComputedStyle(gifSearch).visibility === "hidden" ? "visible" : "hidden" 
    gifSearch.style.opacity = getComputedStyle(gifSearch).visibility === "hidden" ? 1 : 0   
})

gifSearch.addEventListener("click",(e)=>e.stopPropagation())
drawBtn.addEventListener("click",() => { isDrawing = !isDrawing; drawBtn.style.background = isDrawing ? "#f8d75a" : "white"})
colorInput.addEventListener("input",(e) => { currentColor = e.target.value })
strokeInput.addEventListener("input",(e) => { currentStroke = e.target.value })

function drawImage(src){
    
    var gif = document.createElement("img");
    gif.src = src;
    gif.style.width="46%";
    gif.height=100;
    let id = socket.id+Math.random()*10000;
    gif.addEventListener("click",(e)=>{
        gifSearch.style.visibility = "hidden" 
        gifSearch.style.opacity = 0 ;
        const rect = document.getElementById("canvas-container").getBoundingClientRect();
        const xoff = e.clientX - rect.left;
        const yoff = e.clientY - rect.top;
        addImageToDOM(src, xoff, yoff, id, true) 
    })
    document.getElementById("gif-suggestions").appendChild(gif)
}

function addImageToDOM(src, xoff, yoff, id, fromSearch){
    
    var gif = document.createElement("img");
    gif.classList = "gif"
    gif.id = id
    gif.src = src;
    gif.style.top = yoff+"px";
    gif.style.left = xoff+"px";
    dragElement(gif, (x,y)=>socket.emit("gifMoved", {id:id, url:src ,x:x, y:y}))
    gif.addEventListener("mouseenter",()=>{ invalidArea = true })
    gif.addEventListener("mouseleave",()=>{ invalidArea = false })
    
    document.getElementById("canvas-container").insertBefore(gif, document.getElementById("canvas-container").firstChild)
    if(fromSearch)socket.emit("gifAdded", {id:id, url:src ,x:xoff, y:yoff});
}

    socket.on("allCursors",(data)=>{
        if(!data[2]) return;
        let obj = data[2];
        for (let key in obj) {
            addImageToDOM(obj[key].url, obj[key].x, obj[key].y, key, false)
            
        }
    })

    socket.on("gifAddedToDOM",(data)=>{
        addImageToDOM(data.url, data.x, data.y, data.id, false)
    })
    socket.on("gifMovedToDOM",(data)=>{
        let gif = document.getElementById(data.id);
        gif.style.top = data.y+"px";
        gif.style.left = data.x+"px";
    })

    socket.on("key",(key)=>apiKey=key)

gifInput.addEventListener("input",async(e) => { 
    const data = await fetch(`https://tenor.googleapis.com/v2/search?q=${e.target.value}&key=${apiKey}&limit=6`);
    const jsonData = await data.json();
    document.getElementById("gif-suggestions").innerHTML=""
    jsonData.results.forEach(element => {
        drawImage(element.media_formats.gif.url)
    });
})


toolbar.addEventListener("mouseenter",()=>{ invalidArea = true; preventDrag=true })
toolbar.addEventListener("mouseleave",()=>{ invalidArea = false; preventDrag=false })

export { isDrawing, invalidArea, preventDrag, currentColor, currentStroke }