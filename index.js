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

const serialize = (json) => {
	return JSON.stringify(json);
};

wss.on("connection", (ws, request) => {
	console.log("new client");

	ws.on("message", (message) => {
		let gameId;
		let game;
		let name;
		let userId;
		message = JSON.parse(message);
		switch (message.type) {
			case "init":
				gameId = randomGameId();
				games[gameId] = new Game(randomGameId());
				game = games[gameId];

				game.addPlayer(message.name, ws);

				ws.send(serialize({ type: "gameId", gameId }));
				ws.send(serialize({ type: "userId", userId: 1 }));
				console.log(games);
				break;
			case "join":
				if (message.gameId in games) {
					gameId = message.gameId;
					game = games[gameId];

					game.addPlayer(message.name, ws);

					ws.send(serialize({ type: "gameId", gameId }));
					ws.send(serialize({ type: "userId", userId: 2 }));
					game.getPlayer1().send(serialize({ type: "user2n", name: message.name }));
					game
						.getPlayer2()
						.send(serialize({ type: "user2n", name: game.getPlayer1().name }));
				} else {
					ws.send(serialize({ type: "error", message: "invalid game id" }));
				}
				console.log(games);
				break;
			case "updateName":
				gameId = message.gameId;
				userId = message.userId;
				name = message.name;
				game = games[gameId];
				if (userId === 1) {
					game.getPlayer1().setName(name);
					game.getPlayer2().send(serialize({ type: "user2n", name }));
				} else if (userId === 2) {
					game.getPlayer2().setName(name);
					game.getPlayer1().send(serialize({ type: "user2n", name }));
				}
				break;
		}
	});
});

// !SECTION ws
