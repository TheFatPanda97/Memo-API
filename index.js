// SECTION API

import express from "express";
const app = express();
var port = process.env.PORT || 8000;

app.get("/", (req, res) => {
	res.send("hello world");
});

console.log(`listening on port ${port}`);
app.listen(port);

// !SECTION API

// SECTION ws
import ws from "ws";
import Game from "./model/Game";
const wss = new ws.Server({ port: port + 1 });
const games = {};

const getRandInt = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
};

const randomGameId = () => {
	let id = "0000";
	while (id in games) {
		id = "".concat(
			getRandInt(0, 10).toString(),
			getRandInt(0, 10).toString(),
			getRandInt(0, 10).toString(),
			getRandInt(0, 10).toString()
		);
	}
	return id;
};

wss.on("connection", (ws, request) => {
	console.log("new client");

	ws.on("message", (message) => {
		message = JSON.parse(message);
		switch (message.type) {
			case "init":
				let gameId = randomGameId();
				games[gameId] = new Game(randomGameId());
				let game = games[gameId];
				game.addPlayer(message.name);
				ws.send(JSON.stringify({ type: "gameId", gameId }));
				console.log(games);
				break;
		}
	});
});

// !SECTION ws
