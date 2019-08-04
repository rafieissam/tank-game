let Sprite;
Sprite = function(options) {
	this.context = options.context || Sprite.context;
	this.numCols = options.numCols;
	this.numRows = options.numRows || 1;
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.ticksPerFrame = options.ticksPerFrame || 0;
	this.scaleRatio = options.scaleRatio || 1;
	
	this.imageSrc = options.image;
	this.image = new Image();
	this.image.src = this.imageSrc;
	
	let self = this;
	this.image.onload = function() {
		self.fullWidth = self.image.width;	
		self.fullHeight = self.image.height;
	}

	this.frameCol = 0;
	this.frameRow = 0;
	this.tickCount = 0;
	
	Sprite.all.push(this);

	this.update = function() {
		this.tickCount++;
		if (this.tickCount > this.ticksPerFrame) {
			this.tickCount = 0;
			if (this.frameCol < this.numCols - 1) {
				this.frameCol++;
			} else {
				this.frameCol = 0;
				if (this.frameRow < this.numRows - 1) {
					this.frameRow++;
				} else {
					this.frameRow = 0;
				}
			}
		}
	}
	
	this.render = function() {
		let frameWidth = this.fullWidth / this.numCols;
		let frameHeight = this.fullHeight / this.numRows;
		this.context.drawImage(
			this.image,
			this.frameCol * frameWidth,
			this.frameRow * frameHeight,
			frameWidth,
			frameHeight,
			this.x,
			this.y,
			frameWidth * this.scaleRatio,
			frameHeight * this.scaleRatio
		);
	}
	
	return this;
}
Sprite.all = [];
Sprite.renderAll = function() {
	for (var i in Sprite.all) {
		Sprite.all[i].update();
		Sprite.all[i].render();
	}
}

function gameLoop2() {
	window.requestAnimationFrame(gameLoop);
	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#444";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	Sprite.renderAll();
}

// Get canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

Sprite.context = ctx;

/*
new Sprite({
	image: 'http://oi62.tinypic.com/148yf7.jpg',
	numCols: 8,
	numRows: 4,
	x: 700,
	ticksPerFrame: 2
});
*/
// gameLoop();

