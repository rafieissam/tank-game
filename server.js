const express = require("express")
const socketIO = require("socket.io")
const http = require("http")

const Global = require("./global.js")
const env = require("./env.js")
const raf = require("./util/raf.js")
const Tank = require("./util/Tank.js")
const Tile = require("./util/Tile.js")

var app = express()
var server = http.Server(app)
var io = socketIO(server)

app.use(express.static("src"))
app.use(express.static("assets"))
app.get("/", function(req, res){
	res.sendFile(__dirname + "/src/index.html")
})

io.on("connection", function(socket) {
	Global.SOCKET_LIST[socket.id] = socket

	let tank = new Tank(socket.id)
	Global.TANK_LIST[tank.id] = tank
	Global.OBSTACLE_LIST[tank.id] = tank

	socket.on("disconnect", function() {
		delete Global.SOCKET_LIST[socket.id]
		delete Global.TANK_LIST[tank.id]
		delete Global.OBSTACLE_LIST[tank.id]
	})
	
	// Emit
	socket.emit("canvasSize", Global.canvas)
	// if (Object.keys(Global.TILE_LIST).length < 1)
	// 	Tile.genMap()
	// socket.emit("tileMap", Tile.genpacks())

	// Events
	socket.on("genMap", function() {
		Tile.genMap()
		socket.emit("tileMap", Tile.genpacks())
	})

	// Tank Events
	socket.on("keyDown", tank.onkeydown.bind(tank))
	socket.on("keyUp", tank.onkeyup.bind(tank))
	socket.on("die", tank.die.bind(tank))
	
	// Debugging
	if (env.debug) {
		socket.on("debugReq", function(data) {
			socket.emit("debugRes", eval(data))
		})
	}
})

function gameLoop() {
	raf.requestAnimationFrame(gameLoop)
	let bulletpacks = []
	for (var i in Global.BULLET_LIST) {
		let bullet = Global.BULLET_LIST[i]
		bullet.update()
		bulletpacks.push(bullet.pack)
	}
	let tankpacks = []
	for (var i in Global.TANK_LIST) {
		let tank = Global.TANK_LIST[i]
		tank.update()
		tankpacks.push(tank.pack)
	}
	for (var i in Global.SOCKET_LIST) {
		let socket = Global.SOCKET_LIST[i]
		socket.emit("pack", {
			tanks: tankpacks,
			bullets: bulletpacks
		})
	}
}

gameLoop()

let port = env.development ? 3000 : 26281
server.listen(port, function(){
	console.log("Listening On *:" + port)
})
