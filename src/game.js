let socket = io();
let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
let map

// Canvas Size
socket.on('canvasSize', function(data) {
    canvas.width = data.width;
    canvas.height = data.height;
});

// Map
socket.on('tileMap', function(data) {
    map = data
});

// Rendering Packs
socket.on('pack', function(data) {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle="#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i in map) {
        let m = map[i]
        let image = new Image();
        image.src = m.imageSrc;
        ctx.drawImage(
            image,
            m.position.x,
            m.position.y,
            m.dimensions.width,
            m.dimensions.height
        );
        
        // Draw Collider
        let drawCollider = false
        if (drawCollider) {
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "red";
            ctx.moveTo(m.collider.tl.x, m.collider.tl.y);
            ctx.lineTo(m.collider.tr.x, m.collider.tr.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "blue";
            ctx.moveTo(m.collider.tr.x, m.collider.tr.y);
            ctx.lineTo(m.collider.br.x, m.collider.br.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "green";
            ctx.moveTo(m.collider.br.x, m.collider.br.y);
            ctx.lineTo(m.collider.bl.x, m.collider.bl.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "orange";
            ctx.moveTo(m.collider.bl.x, m.collider.bl.y);
            ctx.lineTo(m.collider.tl.x, m.collider.tl.y);
            ctx.stroke();
        }
    }
    
    for (let i in data.tanks) {
        let d = data.tanks[i];

        let x = d.position.x;
        let y = d.position.y;
        let width = d.dimensions.width;
        let height = d.dimensions.height;
        let imageOptions = d.imageOptions;
        let angle = d.angle;

        ctx.save();
        
        // Draw Sprite
        let image = new Image();
        image.src = imageOptions.src;
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate(angle * Math.PI / 180);
        ctx.drawImage(
            image,
            imageOptions.sx,
            imageOptions.sy,
            width,
            height,
            -width / 2,
            -height / 2,
            width,
            height
        );
        
        ctx.restore();
        
        // Draw Collider
        let drawCollider = false
        if (drawCollider) {
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "red";
            ctx.moveTo(d.collider.tl.x, d.collider.tl.y);
            ctx.lineTo(d.collider.tr.x, d.collider.tr.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "blue";
            ctx.moveTo(d.collider.tr.x, d.collider.tr.y);
            ctx.lineTo(d.collider.br.x, d.collider.br.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "green";
            ctx.moveTo(d.collider.br.x, d.collider.br.y);
            ctx.lineTo(d.collider.bl.x, d.collider.bl.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "orange";
            ctx.moveTo(d.collider.bl.x, d.collider.bl.y);
            ctx.lineTo(d.collider.tl.x, d.collider.tl.y);
            ctx.stroke();
        }
    }
    for (let i in data.bullets) {
        let d = data.bullets[i];

        let x = d.position.x;
        let y = d.position.y;
        let width = d.dimensions.width;
        let height = d.dimensions.height;
        let imageSrc = d.imageSrc;

        let image = new Image();
        image.src = imageSrc;

        ctx.drawImage(
            image,
            0,
            0,
            width,
            height,
            x - width / 2,
            y - height / 2,
            width,
            height
        );
        
        let drawCollider = false
        if (drawCollider) {
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "red";
            ctx.moveTo(d.collider.tl.x, d.collider.tl.y);
            ctx.lineTo(d.collider.tr.x, d.collider.tr.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "blue";
            ctx.moveTo(d.collider.tr.x, d.collider.tr.y);
            ctx.lineTo(d.collider.br.x, d.collider.br.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "green";
            ctx.moveTo(d.collider.br.x, d.collider.br.y);
            ctx.lineTo(d.collider.bl.x, d.collider.bl.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "orange";
            ctx.moveTo(d.collider.bl.x, d.collider.bl.y);
            ctx.lineTo(d.collider.tl.x, d.collider.tl.y);
            ctx.stroke();
        }
    }
});

// Emitting Key Presses
let keys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space'
};

window.onkeydown = function(e) {
    socket.emit('keyDown', keys[e.which]);
}
window.onkeyup = function(e) {
    socket.emit('keyUp', keys[e.which]);
}

// Debugging
function debug(msg) {
    socket.emit('debugReq', msg);
}

socket.on('debugRes', function(data) {
    console.table(data);
    console.log(data);
});