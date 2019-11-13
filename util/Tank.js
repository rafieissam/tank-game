const Global = require("../global.js")
const Bullet = require("./Bullet.js")
const Tile = require("./Tile.js")
const Funcs = require("./funcs.js")
const env = require("../env.js")

class Tank {
	static explosion = {
		src: env.host + '/images/explosion.png',
		width: 147/3,
		height: 45,
		numCols: 3,
		ticksPerFrame: 5
	}
	static images = [
		{
			src: env.host + "/images/green.png",
			width: 266/8,
			height: 40,
			numCols: 8,
			ticksPerFrame: 4
		},
		{
			src: env.host + "/images/blue.png",
			width: 278/8,
			height: 40,
			numCols: 8,
			ticksPerFrame: 4
		},
		{
			src: env.host + "/images/orange.png",
			width: 266/8,
			height: 40,
			numCols: 8,
			ticksPerFrame: 4
		},
		{
			src: env.host + "/images/yellow.png",
			width: 278/8,
			height: 40,
			numCols: 8,
			ticksPerFrame: 4
		},
	]
	constructor(id) {
		this.id = id
		this.randImage = Funcs.randElement(Tank.images)
		this.dimensions = {
			width: this.randImage.width,
			height: this.randImage.height
		}
		this.position = {
			x: Global.canvas.width / 2 - this.dimensions.width / 2,
			y: Global.canvas.height / 2 - this.dimensions.height / 2
		}
		this.collider = {
			tl: {
				x: this.position.x,
				y: this.position.y
			},
			tr: {
				x: this.position.x + this.dimensions.width,
				y: this.position.y
			},
			bl: {
				x: this.position.x,
				y: this.position.y + this.dimensions.height
			},
			br: {
				x: this.position.x + this.dimensions.width,
				y: this.position.y + this.dimensions.height
			}
		}
		this.imageOptions = {
			src: this.randImage.src,
			sx: 0,
			sy: 0,
			numCols: this.randImage.numCols,
			ticksPerFrame: this.randImage.ticksPerFrame,
			ticks: 0
		}
		this.dying = false
		this.respawnTime = 3000
		this.canshoot = true
		this.firerate = 200
		this.angle = 0
		this.speed = {x: 0, y: 0}
		this.maxSpeed = 4
		this.keys = {
			up: false,
			right: false,
			down: false,
			left: false,
			space: false
		}
		this.pack = {}
	}
	update() {
		if (this.dying) {
			this.renderSpriteDie()
		} else {
			this.updatePosition()
			this.updateDirection()
			this.updateCollider()
			this.renderSpriteMove()
			this.detectCollision()
			this.shoot()
		}
		this.updatePack()
	}
	onkeydown(data) {
		switch (data) {
			case "up":
				this.keys.up = true
				break
			case "right":
				this.keys.right = true
				break
			case "down":
				this.keys.down = true
				break
			case "left":
				this.keys.left = true
				break
			case "space":
				this.keys.space = true
		}
	}
	onkeyup(data) {
		switch (data) {
			case "up":
				this.keys.up = false
				break
			case "right":
				this.keys.right = false
				break
			case "down":
				this.keys.down = false
				break
			case "left":
				this.keys.left = false
				break
			case "space":
				this.keys.space = false
		}
	}
	updatePosition() {
		this.speed.x = 0
		this.speed.y = 0
		let maxSpeed = this.maxSpeed
		if (
			(this.keys.up && this.keys.left) ||
			(this.keys.up && this.keys.right) ||
			(this.keys.down && this.keys.left) ||
			(this.keys.down && this.keys.right)
			)
			maxSpeed /= Math.sqrt(2)
		if (this.keys.up && this.keys.down) {
			this.speed.y = 0
		} else {
			if (this.keys.up) {
				this.speed.y = -maxSpeed
			}
			if (this.keys.down) {
				this.speed.y = maxSpeed
			}
		}
		if (this.keys.left && this.keys.right) {
			this.speed.x = 0
		} else {
			if (this.keys.left) {
				this.speed.x = -maxSpeed
			}
			if (this.keys.right) {
				this.speed.x = maxSpeed
			}
		}
		this.position.x += this.speed.x
		this.position.y += this.speed.y
	}
	detectCollision() {
		if (this.position.x <= 0) {
			this.speed.x = 0
			this.position.x = 0
		} else if (this.position.x >= Global.canvas.width - this.dimensions.width) {
			this.speed.x = 0
			this.position.x = Global.canvas.width - this.dimensions.width
		}
		if (this.position.y <= 0) {
			this.speed.y = 0
			this.position.y = 0
		} else if (this.position.y >= Global.canvas.height - this.dimensions.height) {
			this.speed.y = 0
			this.position.y = Global.canvas.height - this.dimensions.height
		}
		
		for (let i in Global.OBSTACLE_LIST) {
			let obstacle = Global.OBSTACLE_LIST[i]
			if (obstacle instanceof Tank || obstacle instanceof Tile) {
				let tank = obstacle
				if (tank.id == this.id)
					continue
				let rectangleArea = Funcs.distance(tank.collider.tr, tank.collider.tl) * Funcs.distance(tank.collider.bl, tank.collider.tl)
				let trianglesArea1 = 0
				trianglesArea1 += Funcs.areaTriangle(this.collider.bl, tank.collider.tl, tank.collider.tr)
				trianglesArea1 += Funcs.areaTriangle(this.collider.bl, tank.collider.tl, tank.collider.bl)
				trianglesArea1 += Funcs.areaTriangle(this.collider.bl, tank.collider.br, tank.collider.tr)
				trianglesArea1 += Funcs.areaTriangle(this.collider.bl, tank.collider.br, tank.collider.bl)
				let trianglesArea2 = 0
				trianglesArea2 += Funcs.areaTriangle(this.collider.br, tank.collider.tl, tank.collider.tr)
				trianglesArea2 += Funcs.areaTriangle(this.collider.br, tank.collider.tl, tank.collider.bl)
				trianglesArea2 += Funcs.areaTriangle(this.collider.br, tank.collider.br, tank.collider.tr)
				trianglesArea2 += Funcs.areaTriangle(this.collider.br, tank.collider.br, tank.collider.bl)
				if (Math.round(trianglesArea1) == rectangleArea || Math.round(trianglesArea2) == rectangleArea) {
					this.position.x -= this.speed.x
					this.position.y -= this.speed.y
				}
			} else if (obstacle instanceof Bullet) {
				let bullet = obstacle
				if (bullet.tank_id == this.id)
					continue
				let rectangleArea = Funcs.distance(this.collider.tr, this.collider.tl) * Funcs.distance(this.collider.bl, this.collider.tl)
				let trianglesArea1 = 0
				trianglesArea1 += Funcs.areaTriangle(bullet.collider.bl, this.collider.tl, this.collider.tr)
				trianglesArea1 += Funcs.areaTriangle(bullet.collider.bl, this.collider.tl, this.collider.bl)
				trianglesArea1 += Funcs.areaTriangle(bullet.collider.bl, this.collider.br, this.collider.tr)
				trianglesArea1 += Funcs.areaTriangle(bullet.collider.bl, this.collider.br, this.collider.bl)
				let trianglesArea2 = 0
				trianglesArea2 += Funcs.areaTriangle(bullet.collider.br, this.collider.tl, this.collider.tr)
				trianglesArea2 += Funcs.areaTriangle(bullet.collider.br, this.collider.tl, this.collider.bl)
				trianglesArea2 += Funcs.areaTriangle(bullet.collider.br, this.collider.br, this.collider.tr)
				trianglesArea2 += Funcs.areaTriangle(bullet.collider.br, this.collider.br, this.collider.bl)
				if (Math.round(trianglesArea1) == rectangleArea || Math.round(trianglesArea2) == rectangleArea) {
					this.die()
					delete Global.OBSTACLE_LIST[bullet.id]
					delete Global.BULLET_LIST[bullet.id]
				}
			}
		}
	}
	updateDirection() {
		let up = this.keys.up
		let down = this.keys.down
		let left = this.keys.left
		let right = this.keys.right
		if (left && right && down)
			this.angle = 180
		else if (left && right && up)
			this.angle = 0
		else if (up && down && right)
			this.angle = 90
		else if (up && down && left)
			this.angle = 270
		else if (up && right)
			this.angle = 45 * 2 / 2
		else if (up && left)
			this.angle = 45 * 14 / 2
		else if (down && right)
			this.angle = 45 * 6 / 2
		else if (down && left)
			this.angle = 45 * 10 / 2
		else if (left)
			this.angle = 270
		else if (right)
			this.angle = 90
		else if (up)
			this.angle = 0
		else if (down)
			this.angle = 180
	}
	renderSpriteMove() {
		if (this.speed.x || this.speed.y) {
			if (this.imageOptions.sx + this.dimensions.width < this.dimensions.width * this.imageOptions.numCols) {
				if (this.imageOptions.ticks >= this.imageOptions.ticksPerFrame) {
					this.imageOptions.sx += this.dimensions.width
					this.imageOptions.ticks = 0
				} else {
					this.imageOptions.ticks++
				}
			} else {
				this.imageOptions.sx = 0
			}
		}
	}
	updateCollider() {
		let diagonal = Math.sqrt(this.dimensions.width * this.dimensions.width + this.dimensions.height * this.dimensions.height)
		let side = diagonal / 2
		let base = this.dimensions.width
		// Half the Small Angle Made by Rectangle Diagonals
		let angle = 180 * Math.asin((base / 2) / side) / Math.PI
		let vectorTopRight = this.angle + 90 - angle
		let vectorTopLeft = this.angle + 90 + angle
		while (vectorTopLeft > 360)
			vectorTopLeft -= 360
		while (vectorTopRight > 360)
			vectorTopRight -= 360
		let center = {
			x: this.position.x + this.dimensions.width / 2,
			y: this.position.y + this.dimensions.height / 2
		}
		this.collider.tl = {
			x: center.x + Math.cos(vectorTopLeft * Math.PI / 180) * side,
			y: center.y + Math.sin(vectorTopLeft * Math.PI / 180) * side
		}
		this.collider.tr = {
			x: center.x + Math.cos(vectorTopRight * Math.PI / 180) * side,
			y: center.y + Math.sin(vectorTopRight * Math.PI / 180) * side
		}
		this.collider.bl = {
			x: center.x + Math.cos((vectorTopRight + 180) * Math.PI / 180) * side,
			y: center.y + Math.sin((vectorTopRight + 180) * Math.PI / 180) * side
		}
		this.collider.br = {
			x: center.x + Math.cos((vectorTopLeft + 180) * Math.PI / 180) * side,
			y: center.y + Math.sin((vectorTopLeft + 180) * Math.PI / 180) * side
		}
	}
	shoot() {
		if (!this.canshoot || !this.keys.space)
			return
		this.canshoot = false
		let bullet = new Bullet(
			this.id + Date.now(),
			this.id,
			{
				width: this.dimensions.width,
				height: this.dimensions.height,
			},
			{
				x: this.position.x + this.dimensions.width / 2,
				y: this.position.y + this.dimensions.height / 2
			},
			this.angle
		)
		Global.OBSTACLE_LIST[bullet.id] = bullet
		Global.BULLET_LIST[bullet.id] = bullet
		setTimeout(() => {
			this.canshoot = true
		}, this.firerate)
	}
	die() {
		this.imageOptions.src = Tank.explosion.src
		this.imageOptions.numCols = Tank.explosion.numCols
		this.imageOptions.ticksPerFrame = Tank.explosion.ticksPerFrame
		this.dimensions.width = Tank.explosion.width
		this.dimensions.height = Tank.explosion.height
		this.imageOptions.ticks = 0
		this.imageOptions.sx = 0
		this.position.x = this.position.x + this.randImage.width / 2 - this.dimensions.width / 2
		this.position.y = this.position.y + this.randImage.height / 2 - this.dimensions.height / 2
		this.dying = true
	}
	renderSpriteDie() {
		if (this.imageOptions.sx + this.dimensions.width < this.dimensions.width * this.imageOptions.numCols) {
			if (this.imageOptions.ticks >= this.imageOptions.ticksPerFrame) {
				this.imageOptions.sx += this.dimensions.width
				this.imageOptions.ticks = 0
			} else {
				this.imageOptions.ticks++
			}
		} else {
			this.imageOptions.src = ''
			this.dimensions.width = 0
			this.dimensions.height = 0
			setTimeout(() => {
				this.dying = false
				this.reset()
			}, this.respawnTime)
		}
	}
	reset() {
		this.keys.up = false
		this.keys.right = false
		this.keys.down = false
		this.keys.left = false
		this.position.x = Global.canvas.width / 2 - this.randImage.width / 2,
		this.position.y = Global.canvas.height / 2 - this.randImage.height / 2
		this.speed.x = 0
		this.speed.y = 0
		this.angle = 0

		this.dimensions.width = this.randImage.width
		this.dimensions.height = this.randImage.height
		this.imageOptions.src = this.randImage.src
		this.imageOptions.sx = 0
		this.imageOptions.sy = 0
		this.imageOptions.numCols = this.randImage.numCols
		this.imageOptions.ticksPerFrame = this.randImage.ticksPerFrame
		this.imageOptions.ticks = 0
	}
	updatePack() {
		this.pack = {
			id: this.id,
			position: this.position,
			dimensions: this.dimensions,
			imageOptions:	{
				src: this.imageOptions.src,
				sx: this.imageOptions.sx,
				sy: this.imageOptions.sy
			},
			angle: this.angle,
			collider: this.collider
		}
	}
}

module.exports = Tank