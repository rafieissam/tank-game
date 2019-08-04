import Global from '../global.js'
import * as env from '../env.js'

let Bullet
Bullet = function(id, tank_id, tank_dimensions, position, angle) {
    let self = this
    self.id = id
    self.tank_id = tank_id
    self.position = {
        x: position.x,
        y: position.y
    }
    self.speed = {
        x: 0,
        y: 0
    }
    self.dimensions = {
        width: Bullet.image.width,
        height: Bullet.image.height
    }
    self.tank_dimensions = {
        width: tank_dimensions.width,
        height: tank_dimensions.height
    }
    self.collider = {
        tl: {
            x: self.position.x - self.dimensions.width / 2,
            y: self.position.y - self.dimensions.height / 2
        },
        tr: {
            x: self.position.x + self.dimensions.width / 2,
            y: self.position.y - self.dimensions.height / 2
        },
        bl: {
            x: self.position.x - self.dimensions.width / 2,
            y: self.position.y + self.dimensions.height / 2
        },
        br: {
            x: self.position.x + self.dimensions.width / 2,
            y: self.position.y + self.dimensions.height / 2
        }
    }
    self.angle = angle
    self.maxSpeed = 7
    self.pack = {}
    
    self.position.x += (self.tank_dimensions.width / 2) * Math.cos((angle - 90) * Math.PI / 180)
    self.position.y += (self.tank_dimensions.height / 2) * Math.sin((angle - 90) * Math.PI / 180)

    self.speed.x = self.maxSpeed * Math.cos((angle - 90) * Math.PI / 180)
    self.speed.y = self.maxSpeed * Math.sin((angle - 90) * Math.PI / 180)

    self.update = function() {
        self.updatePosition()
        self.updateCollider()
        self.updatePack()
    }

    self.updatePosition = function() {
        self.position.x += self.speed.x
        self.position.y += self.speed.y
        if (
            (self.position.x <= 0) ||
            (self.position.x >= Global.canvas.width - self.dimensions.width) ||
            (self.position.y <= 0) ||
            (self.position.y >= Global.canvas.height - self.dimensions.height)
        ) {
            delete Global.OBSTACLE_LIST[self.id]
            delete Global.BULLET_LIST[self.id]
        }
    }

    self.updateCollider = function() {
        self.collider = {
            tl: {
                x: self.position.x - self.dimensions.width / 2,
                y: self.position.y - self.dimensions.height / 2
            },
            tr: {
                x: self.position.x + self.dimensions.width / 2,
                y: self.position.y - self.dimensions.height / 2
            },
            bl: {
                x: self.position.x - self.dimensions.width / 2,
                y: self.position.y + self.dimensions.height / 2
            },
            br: {
                x: self.position.x + self.dimensions.width / 2,
                y: self.position.y + self.dimensions.height / 2
            }
        }
    }

    self.updatePack = function() {
        self.pack = {
            id: self.id,
            position: self.position,
            dimensions: self.dimensions,
            imageSrc: Bullet.image.src,
            collider: self.collider
        }
    }

    return self
}

Bullet.image = {
    src: env.host + '/images/shot.png',
    width: 10,
    height: 10
}

export default Bullet