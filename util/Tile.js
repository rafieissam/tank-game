import Global from '../global.js'
import * as env from '../env.js'

let Tile
Tile = function(id, x, y) {
  let self = this
  self.id = id
  self.dimensions = {
    width: Global.canvas.tileSize,
    height: Global.canvas.tileSize
  }
  self.position = {x, y}
  self.collider = {
    tl: {
      x: self.position.x,
      y: self.position.y
    },
    tr: {
      x: self.position.x + self.dimensions.width,
      y: self.position.y
    },
    bl: {
      x: self.position.x,
      y: self.position.y + self.dimensions.height
    },
    br: {
      x: self.position.x + self.dimensions.width,
      y: self.position.y + self.dimensions.height
    }
  }
  self.imageSrc = env.host + "/images/tile.png"

  self.pack = {
    id: self.id,
    position: self.position,
    dimensions: self.dimensions,
    imageSrc: self.imageSrc,
    collider: self.collider
  }

  Global.TILE_LIST[self.id] = self
  Global.OBSTACLE_LIST[self.id] = self

  self.destroy = function() {
    delete Global.TILE_LIST[self.id]
    delete Global.OBSTACLE_LIST[self.id]
  }

  return self
}

Tile.clearTiles = function() {
  for (var i in Global.TILE_LIST) {
    delete Global.OBSTACLE_LIST[i]
    delete Global.TILE_LIST[i]
  }
}

Tile.mapAccessible = function(obstacleMap, currentObstacleCount) {
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

Tile.genMap = function() {
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

Tile.genpacks = function() {
  let tilepacks = []
  for (var i in Global.TILE_LIST)
    tilepacks.push(Global.TILE_LIST[i])
  return tilepacks
}

Tile.fillPercent = 0.6;

export default Tile