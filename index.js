// SECTION API

import express from "express"
const app = express()
var port = process.env.PORT || 8000

app.get("/", (req, res) => {
	res.send("hello world")
})

console.log(`listening on port ${port}`)
app.listen(port)

// !SECTION API

// SECTION ws
import ws from "ws"
import Game from "./model/Game"
const wss = new ws.Server({ port: port + 1 })
let game = new Game(1234)

wss.on("connection", (ws, request) => {
	console.log("new client")
	ws.send("hello there")

	ws.on("message", (message) => {
		message = JSON.parse(message)
		switch (message.type) {
			case "init":
				game.addPlayer(message.name)
                break
		}
	})
})

// !SECTION ws
