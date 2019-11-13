const Global = require("../global.js")
const env = require("../env.js")

class Bullet {
	static image = {
		src: env.host + '/images/shot.png',
		width: 10,
		height: 10
	}
	constructor(id, tank_id, tank_dimensions, position, angle) {
		this.id = id
		this.tank_id = tank_id
		this.position = {
			x: position.x,
			y: position.y
		}
		this.speed = {
			x: 0,
			y: 0
		}
		this.dimensions = {
			width: Bullet.image.width,
			height: Bullet.image.height
		}
		this.tank_dimensions = {
			width: tank_dimensions.width,
			height: tank_dimensions.height
		}
		this.collider = {
			tl: {
				x: this.position.x - this.dimensions.width / 2,
				y: this.position.y - this.dimensions.height / 2
			},
			tr: {
				x: this.position.x + this.dimensions.width / 2,
				y: this.position.y - this.dimensions.height / 2
			},
			bl: {
				x: this.position.x - this.dimensions.width / 2,
				y: this.position.y + this.dimensions.height / 2
			},
			br: {
				x: this.position.x + this.dimensions.width / 2,
				y: this.position.y + this.dimensions.height / 2
			}
		}
		this.angle = angle
		this.maxSpeed = 7
		this.pack = {}
		
		this.position.x += (this.tank_dimensions.width / 2) * Math.cos((angle - 90) * Math.PI / 180)
		this.position.y += (this.tank_dimensions.height / 2) * Math.sin((angle - 90) * Math.PI / 180)
		
		this.speed.x = this.maxSpeed * Math.cos((angle - 90) * Math.PI / 180)
		this.speed.y = this.maxSpeed * Math.sin((angle - 90) * Math.PI / 180)
	}
	update() {
		this.updatePosition()
		this.updateCollider()
		this.updatePack()
	}
	updatePosition() {
		this.position.x += this.speed.x
		this.position.y += this.speed.y
		if (
			(this.position.x <= 0) ||
			(this.position.x >= Global.canvas.width - this.dimensions.width) ||
			(this.position.y <= 0) ||
			(this.position.y >= Global.canvas.height - this.dimensions.height)
		) {
			delete Global.OBSTACLE_LIST[this.id]
			delete Global.BULLET_LIST[this.id]
		}
	}
	updateCollider() {
		this.collider = {
			tl: {
				x: this.position.x - this.dimensions.width / 2,
				y: this.position.y - this.dimensions.height / 2
			},
			tr: {
				x: this.position.x + this.dimensions.width / 2,
				y: this.position.y - this.dimensions.height / 2
			},
			bl: {
				x: this.position.x - this.dimensions.width / 2,
				y: this.position.y + this.dimensions.height / 2
			},
			br: {
				x: this.position.x + this.dimensions.width / 2,
				y: this.position.y + this.dimensions.height / 2
			}
		}
	}
	updatePack() {
		this.pack = {
			id: this.id,
			position: this.position,
			dimensions: this.dimensions,
			imageSrc: Bullet.image.src,
			collider: this.collider
		}
	}
}

module.exports = Bullet