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
const WebSocketServer = ws.Server
var wss = new WebSocketServer({ port: port + 1 })

wss.on("connection", (ws, request) => {
	console.log("new client")
})

// !SECTION ws
