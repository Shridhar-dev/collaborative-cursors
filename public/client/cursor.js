const socket = io();
const canvas = document.getElementById("canvas");

function getRandomColor(){
    let val1 = Math.floor((Math.random() * 255-180))+180;
    let val2 = Math.floor((Math.random() * 255-180))+180;
    let val3 = Math.floor((Math.random() * 255-180))+180;

    return {
        val1,val2,val3
    };
}

function createCursor(id, other, name="user", x ,y) {
    const iconContainer = document.createElement("div");
    const iconUserInfo = document.createElement("p");
    iconUserInfo.innerText = name;
    iconUserInfo.classList = "cursor-info";
            

    const iconSvgTemplate = document.getElementById("cursor-template");
    const iconPathTemplate = document.getElementById("cursor-template-path");

    const iconSvg = iconSvgTemplate.cloneNode(true)
    const iconPath = iconPathTemplate.cloneNode(true);
    iconSvg.style.display = "block"
    iconContainer.style.display = "block"
    iconContainer.id = id
    if(other) iconContainer.style.position="absolute";
    iconContainer.classList.add('cursor');
    let {val1,val2,val3} = getRandomColor();
    iconPath.setAttribute('fill', `rgb(${val1},${val2},${val3})`);
    iconUserInfo.style.background = `rgb(${val1},${val2},${val3})`;

    iconSvg.appendChild(iconPath)
    iconContainer.appendChild(iconUserInfo)
    iconContainer.appendChild(iconSvg)
    if(x && y){
        iconContainer.style.left = x;
        iconContainer.style.top = y;
    }
    return iconContainer;
}

socket.on("connect",()=>{
    const cursor = createCursor(socket.id);
    canvas.onmousemove = (e) =>{
        cursor.style.top = Math.abs(e.clientY) + 'px';
        cursor.style.left = Math.abs(e.clientX) + 'px' ;
        socket.emit('cursorMoved', 
            {id:socket.id,x:Math.abs(e.offsetX) + 'px',y:Math.abs(e.offsetY) + 'px'}
        );
    }

    canvas.appendChild(cursor)
})

socket.on("cursorJoined",(id)=>{    
    const cursor = createCursor(id, true)
    canvas.appendChild(cursor)
})

socket.on("allCursors", (data)=>{
            
    for (let key in data) {
        if(key === socket.id) continue;

        const cursor = createCursor(key, true,data[key].name || "user", data[key].x, data[key].y)
                
        canvas.appendChild(cursor)
    }
})

socket.on("cursorPositionUpdate",(data)=>{
    if(socket.id === data.id) return;
    const targetCursor = document.getElementById(data.id);        
    targetCursor.style.top = data.y;
    targetCursor.style.left = data.x ;   
})

socket.on("cursorNameChanged",(data)=>{
    if(socket.id === data.id) return;
    const targetCursor = document.getElementById(data.id);      
    targetCursor.firstChild.innerText = data.name   
})

document.getElementById("username-input").oninput = (e) =>{
    document.getElementById(socket.id).firstChild.innerText = e.target.value
    socket.emit('cursorNameChange',e.target.value);
}

socket.on("cursorLeft",(id)=>{
    const targetCursor = document.getElementById(id)
    canvas.removeChild(targetCursor) 
})