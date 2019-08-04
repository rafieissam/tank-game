import Global from '../global.js'
import Bullet from './Bullet.js'
import Tile from './Tile.js'
import * as Funcs from './funcs.js'
import * as env from '../env.js'

let Tank
Tank = function(id) {
  let self = this
  self.id = id
  self.randImage = Funcs.randElement(Tank.images)
  self.dimensions = {
    width: self.randImage.width,
    height: self.randImage.height
  }
  self.position = {
    x: Global.canvas.width / 2 - self.dimensions.width / 2,
    y: Global.canvas.height / 2 - self.dimensions.height / 2
  }
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
  self.imageOptions = {
    src: self.randImage.src,
    sx: 0,
    sy: 0,
    numCols: self.randImage.numCols,
    ticksPerFrame: self.randImage.ticksPerFrame,
    ticks: 0
  }
  self.dying = false
  self.respawnTime = 3000
  self.canshoot = true
  self.firerate = 200
  self.angle = 0
  self.speed = {x: 0, y: 0}
  self.maxSpeed = 4
  self.keys = {
    up: false,
    right: false,
    down: false,
    left: false,
    space: false
  }
  self.pack = {}

  self.update = function() {
    if (self.dying) {
      self.renderSpriteDie()
    } else {
      self.updatePosition()
      self.updateDirection()
      self.updateCollider()
      self.renderSpriteMove()
      self.detectCollision()
      self.shoot()
    }
    self.updatePack()
  }
  
  self.onkeydown = function(data) {
    switch (data) {
      case 'up':
        self.keys.up = true
        break
      case 'right':
        self.keys.right = true
        break
      case 'down':
        self.keys.down = true
        break
      case 'left':
        self.keys.left = true
        break
      case 'space':
        self.keys.space = true
    }
  }

  self.onkeyup = function(data) {
    switch (data) {
      case 'up':
        self.keys.up = false
        break
      case 'right':
        self.keys.right = false
        break
      case 'down':
        self.keys.down = false
        break
      case 'left':
        self.keys.left = false
        break
      case 'space':
        self.keys.space = false
    }
  }

  self.updatePosition = function() {
    self.speed.x = 0
    self.speed.y = 0
    let maxSpeed = self.maxSpeed
    if (
      (self.keys.up && self.keys.left) ||
      (self.keys.up && self.keys.right) ||
      (self.keys.down && self.keys.left) ||
      (self.keys.down && self.keys.right)
      )
      maxSpeed /= Math.sqrt(2)
    if (self.keys.up && self.keys.down) {
      self.speed.y = 0
    } else {
      if (self.keys.up) {
        self.speed.y = -maxSpeed
      }
      if (self.keys.down) {
        self.speed.y = maxSpeed
      }
    }
    if (self.keys.left && self.keys.right) {
      self.speed.x = 0
    } else {
      if (self.keys.left) {
        self.speed.x = -maxSpeed
      }
      if (self.keys.right) {
        self.speed.x = maxSpeed
      }
    }
    self.position.x += self.speed.x
    self.position.y += self.speed.y
  }

  self.detectCollision = function() {
    if (self.position.x <= 0) {
      self.speed.x = 0
      self.position.x = 0
    } else if (self.position.x >= Global.canvas.width - self.dimensions.width) {
      self.speed.x = 0
      self.position.x = Global.canvas.width - self.dimensions.width
    }
    if (self.position.y <= 0) {
      self.speed.y = 0
      self.position.y = 0
    } else if (self.position.y >= Global.canvas.height - self.dimensions.height) {
      self.speed.y = 0
      self.position.y = Global.canvas.height - self.dimensions.height
    }
    
    for (let i in Global.OBSTACLE_LIST) {
      let obstacle = Global.OBSTACLE_LIST[i]
      if (obstacle instanceof Tank || obstacle instanceof Tile) {
        let tank = obstacle
        if (tank.id == self.id)
          continue
        let rectangleArea = Funcs.distance(tank.collider.tr, tank.collider.tl) * Funcs.distance(tank.collider.bl, tank.collider.tl)
        let trianglesArea1 = 0
        trianglesArea1 += Funcs.areaTriangle(self.collider.bl, tank.collider.tl, tank.collider.tr)
        trianglesArea1 += Funcs.areaTriangle(self.collider.bl, tank.collider.tl, tank.collider.bl)
        trianglesArea1 += Funcs.areaTriangle(self.collider.bl, tank.collider.br, tank.collider.tr)
        trianglesArea1 += Funcs.areaTriangle(self.collider.bl, tank.collider.br, tank.collider.bl)
        let trianglesArea2 = 0
        trianglesArea2 += Funcs.areaTriangle(self.collider.br, tank.collider.tl, tank.collider.tr)
        trianglesArea2 += Funcs.areaTriangle(self.collider.br, tank.collider.tl, tank.collider.bl)
        trianglesArea2 += Funcs.areaTriangle(self.collider.br, tank.collider.br, tank.collider.tr)
        trianglesArea2 += Funcs.areaTriangle(self.collider.br, tank.collider.br, tank.collider.bl)
        if (Math.round(trianglesArea1) == rectangleArea || Math.round(trianglesArea2) == rectangleArea) {
          self.position.x -= self.speed.x
          self.position.y -= self.speed.y
        }
      } else if (obstacle instanceof Bullet) {
        let bullet = obstacle
        if (bullet.tank_id == self.id)
          continue
        let rectangleArea = Funcs.distance(self.collider.tr, self.collider.tl) * Funcs.distance(self.collider.bl, self.collider.tl)
        let trianglesArea1 = 0
        trianglesArea1 += Funcs.areaTriangle(bullet.collider.bl, self.collider.tl, self.collider.tr)
        trianglesArea1 += Funcs.areaTriangle(bullet.collider.bl, self.collider.tl, self.collider.bl)
        trianglesArea1 += Funcs.areaTriangle(bullet.collider.bl, self.collider.br, self.collider.tr)
        trianglesArea1 += Funcs.areaTriangle(bullet.collider.bl, self.collider.br, self.collider.bl)
        let trianglesArea2 = 0
        trianglesArea2 += Funcs.areaTriangle(bullet.collider.br, self.collider.tl, self.collider.tr)
        trianglesArea2 += Funcs.areaTriangle(bullet.collider.br, self.collider.tl, self.collider.bl)
        trianglesArea2 += Funcs.areaTriangle(bullet.collider.br, self.collider.br, self.collider.tr)
        trianglesArea2 += Funcs.areaTriangle(bullet.collider.br, self.collider.br, self.collider.bl)
        if (Math.round(trianglesArea1) == rectangleArea || Math.round(trianglesArea2) == rectangleArea) {
          self.die()
          delete Global.OBSTACLE_LIST[bullet.id]
          delete Global.BULLET_LIST[bullet.id]
        }
      }
    }
  }

  self.updateDirection = function() {
    let up = self.keys.up
    let down = self.keys.down
    let left = self.keys.left
    let right = self.keys.right
    if (left && right && down)
      self.angle = 180
    else if (left && right && up)
      self.angle = 0
    else if (up && down && right)
      self.angle = 90
    else if (up && down && left)
      self.angle = 270
    else if (up && right)
      self.angle = 45 * 2 / 2
    else if (up && left)
      self.angle = 45 * 14 / 2
    else if (down && right)
      self.angle = 45 * 6 / 2
    else if (down && left)
      self.angle = 45 * 10 / 2
    else if (left)
      self.angle = 270
    else if (right)
      self.angle = 90
    else if (up)
      self.angle = 0
    else if (down)
      self.angle = 180
  }

  self.renderSpriteMove = function() {
    if (self.speed.x || self.speed.y) {
      if (self.imageOptions.sx + self.dimensions.width < self.dimensions.width * self.imageOptions.numCols) {
        if (self.imageOptions.ticks >= self.imageOptions.ticksPerFrame) {
          self.imageOptions.sx += self.dimensions.width
          self.imageOptions.ticks = 0
        } else {
          self.imageOptions.ticks++
        }
      } else {
        self.imageOptions.sx = 0
      }
    }
  }

  self.updateCollider = function() {
    let diagonal = Math.sqrt(self.dimensions.width * self.dimensions.width + self.dimensions.height * self.dimensions.height)
    let side = diagonal / 2
    let base = self.dimensions.width
    // Half the Small Angle Made by Rectangle Diagonals
    let angle = 180 * Math.asin((base / 2) / side) / Math.PI
    let vectorTopRight = self.angle + 90 - angle
    let vectorTopLeft = self.angle + 90 + angle
    while (vectorTopLeft > 360)
      vectorTopLeft -= 360
    while (vectorTopRight > 360)
      vectorTopRight -= 360
    let center = {
      x: self.position.x + self.dimensions.width / 2,
      y: self.position.y + self.dimensions.height / 2
    }
    self.collider.tl = {
      x: center.x + Math.cos(vectorTopLeft * Math.PI / 180) * side,
      y: center.y + Math.sin(vectorTopLeft * Math.PI / 180) * side
    }
    self.collider.tr = {
      x: center.x + Math.cos(vectorTopRight * Math.PI / 180) * side,
      y: center.y + Math.sin(vectorTopRight * Math.PI / 180) * side
    }
    self.collider.bl = {
      x: center.x + Math.cos((vectorTopRight + 180) * Math.PI / 180) * side,
      y: center.y + Math.sin((vectorTopRight + 180) * Math.PI / 180) * side
    }
    self.collider.br = {
      x: center.x + Math.cos((vectorTopLeft + 180) * Math.PI / 180) * side,
      y: center.y + Math.sin((vectorTopLeft + 180) * Math.PI / 180) * side
    }
  }

  self.shoot = function() {
    if (!self.canshoot || !self.keys.space)
      return
    self.canshoot = false
    let bullet = new Bullet(
      self.id + Date.now(),
      self.id,
      {
        width: self.dimensions.width,
        height: self.dimensions.height,
      },
      {
        x: self.position.x + self.dimensions.width / 2,
        y: self.position.y + self.dimensions.height / 2
      },
      self.angle
    )
    Global.OBSTACLE_LIST[bullet.id] = bullet
    Global.BULLET_LIST[bullet.id] = bullet
    setTimeout(function() {
      self.canshoot = true
    }, self.firerate)
  }

  self.die = function() {
    self.imageOptions.src = Tank.explosion.src
    self.imageOptions.numCols = Tank.explosion.numCols
    self.imageOptions.ticksPerFrame = Tank.explosion.ticksPerFrame
    self.dimensions.width = Tank.explosion.width
    self.dimensions.height = Tank.explosion.height
    self.imageOptions.ticks = 0
    self.imageOptions.sx = 0
    self.position.x = self.position.x + self.randImage.width / 2 - self.dimensions.width / 2
    self.position.y = self.position.y + self.randImage.height / 2 - self.dimensions.height / 2
    self.dying = true
  }

  self.renderSpriteDie = function() {
    if (self.imageOptions.sx + self.dimensions.width < self.dimensions.width * self.imageOptions.numCols) {
      if (self.imageOptions.ticks >= self.imageOptions.ticksPerFrame) {
        self.imageOptions.sx += self.dimensions.width
        self.imageOptions.ticks = 0
      } else {
        self.imageOptions.ticks++
      }
    } else {
      self.imageOptions.src = ''
      self.dimensions.width = 0
      self.dimensions.height = 0
      setTimeout(function() {
        self.dying = false
        self.reset()
      }, self.respawnTime)
    }
  }

  self.reset = function() {
    self.keys.up = false
    self.keys.right = false
    self.keys.down = false
    self.keys.left = false
    self.position.x = Global.canvas.width / 2 - self.randImage.width / 2,
    self.position.y = Global.canvas.height / 2 - self.randImage.height / 2
    self.speed.x = 0
    self.speed.y = 0
    self.angle = 0

    self.dimensions.width = self.randImage.width
    self.dimensions.height = self.randImage.height
    self.imageOptions.src = self.randImage.src
    self.imageOptions.sx = 0
    self.imageOptions.sy = 0
    self.imageOptions.numCols = self.randImage.numCols
    self.imageOptions.ticksPerFrame = self.randImage.ticksPerFrame
    self.imageOptions.ticks = 0
  }

  self.updatePack = function() {
    self.pack = {
      id: self.id,
      position: self.position,
      dimensions: self.dimensions,
      imageOptions:  {
        src: self.imageOptions.src,
        sx: self.imageOptions.sx,
        sy: self.imageOptions.sy
      },
      angle: self.angle,
      collider: self.collider
    }
  }

  return self
}

Tank.explosion = {
  src: env.host + '/images/explosion.png',
  width: 147/3,
  height: 45,
  numCols: 3,
  ticksPerFrame: 5
}

Tank.images = [
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

export default Tank