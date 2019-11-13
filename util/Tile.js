const Global = require("../global.js")
const env = require("../env.js")

class Tile {
	static fillPercent = 0.6;
	constructor(id, x, y) {
		this.id = id
		this.dimensions = {
			width: Global.canvas.tileSize,
			height: Global.canvas.tileSize
		}
		this.position = {x, y}
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
		this.imageSrc = env.host + "/images/tile.png"
	
		this.pack = {
			id: this.id,
			position: this.position,
			dimensions: this.dimensions,
			imageSrc: this.imageSrc,
			collider: this.collider
		}
	
		Global.TILE_LIST[this.id] = this
		Global.OBSTACLE_LIST[this.id] = this
	}
	destroy() {
		delete Global.TILE_LIST[this.id]
		delete Global.OBSTACLE_LIST[this.id]
	}
	static clearTiles() {
		for (var i in Global.TILE_LIST) {
			delete Global.OBSTACLE_LIST[i]
			delete Global.TILE_LIST[i]
		}
	}
	static mapAccessible(obstacleMap, currentObstacleCount) {
		let mapFlags = []
		for (let i = 0 ; i < obstacleMap.length ; i++) {
			mapFlags[i] = []
			for (let j = 0 ; j < obstacleMap[i].length ; j++) {
				mapFlags[i][j] = false
			}
		}
		let mapSize = {
			x: Global.canvas.width / Global.canvas.tileSize,
			y: Global.canvas.height / Global.canvas.tileSize
		}
		let mapCenter = {
			x: Math.floor(mapSize.x / 2), 
			y: Math.floor(mapSize.y / 2)
		}
	
		let queue = []
		queue.push(mapCenter)
		mapFlags[mapCenter.x][mapCenter.y] = true
		let accessibleTileCount = 1
	
		while (queue.length > 0) {
			let tile = queue.pop()
			for (let x = -1; x <= 1; x ++) {
				for (let y = -1; y <= 1; y ++) {
					let neighbourX = tile.x + x
					let neighbourY = tile.y + y
					if (x == 0 || y == 0) {
						if (neighbourX >= 0 && neighbourX < obstacleMap.length && neighbourY >= 0 && neighbourY < obstacleMap[0].length) {
							if (!mapFlags[neighbourX][neighbourY] && !obstacleMap[neighbourX][neighbourY]) {
								mapFlags[neighbourX][neighbourY] = true
								queue.push({x: neighbourX, y: neighbourY})
								accessibleTileCount++
							}
						}
					}
				}
			}
		}
		let targetAccessibleTileCount = mapSize.x * mapSize.y - currentObstacleCount
		return targetAccessibleTileCount == accessibleTileCount
	}
	static genMap() {
		let mapSize = {
			x: Global.canvas.width / Global.canvas.tileSize,
			y: Global.canvas.height / Global.canvas.tileSize
		}
		let mapCenter = {
			x: Math.floor(mapSize.x / 2), 
			y: Math.floor(mapSize.y / 2)
		}
		let obstacleMap = [];
		for (let i = 0 ; i < mapSize.x ; i++) {
			obstacleMap[i] = [];
			for (let j = 0 ; j < mapSize.y ; j++) {
				obstacleMap[i][j] = false;
			} 
		}
		let obstacleCount = Math.round(mapSize.x * mapSize.y * Tile.fillPercent)
		let currentObstacleCount = 0
		
		while (currentObstacleCount < obstacleCount) {
			let randomCoord
			do {
				randomCoord = {
					x: Math.floor(Math.random() * mapSize.x),
					y: Math.floor(Math.random() * mapSize.y)
				}
			} while (obstacleMap[randomCoord.x][randomCoord.y])
			obstacleMap[randomCoord.x][randomCoord.y] = true
			currentObstacleCount++
			if ((randomCoord.x == mapCenter.x && randomCoord.y == mapCenter.y) || !Tile.mapAccessible(obstacleMap, currentObstacleCount)) {
				obstacleMap[randomCoord.x][randomCoord.y] = false
				currentObstacleCount--
			}
		}
		Tile.clearTiles()
		for (let i = 0 ; i < obstacleMap.length ; i++) {
			for (let j = 0 ; j < obstacleMap[i].length ; j++) {
				if (obstacleMap[i][j])
					new Tile('tile-' + i + j, i * Global.canvas.tileSize, j * Global.canvas.tileSize)
			}
		}
	}
	static genpacks() {
		let tilepacks = []
		for (var i in Global.TILE_LIST)
			tilepacks.push(Global.TILE_LIST[i])
		return tilepacks
	}
}

module.exports = Tile