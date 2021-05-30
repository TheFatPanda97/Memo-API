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

	ws.on("close", () => {
		if (ws.gameId in games) {
			console.log("removing games");
			let game = games[ws.gameId];
			let player1 = game.getPlayer1();
			let player2 = game.getPlayer2();
			if (!player1 && !player2) {
				delete games[ws.gameId];
			}
		}
	});

	ws.on("message", (message) => {
		let gameId;
		let game;
		let name;
		let userId;
		let coord;
		message = JSON.parse(message);
		switch (message.type) {
			case "init":
				gameId = randomGameId();
				games[gameId] = new Game(randomGameId());
				game = games[gameId];
				ws.gameId = gameId;
				ws.userId = 1;

				game.addPlayer(message.name, ws);

				ws.send(serialize({ type: "gameId", gameId }));

				break;
			case "join":
				if (message.gameId in games) {
					gameId = message.gameId;
					game = games[gameId];
					ws.gameId = gameId;
					ws.userId = 2;

					game.addPlayer(message.name, ws);

					ws.send(serialize({ type: "gameId", gameId }));
					game.getPlayer1().send(serialize({ type: "player2Name", name: message.name }));
					game
						.getPlayer2()
						.send(serialize({ type: "player2Name", name: game.getPlayer1().name }));
				} else {
					ws.send(serialize({ type: "error", message: "invalid game id" }));
					ws.close();
				}

				break;
			case "updateName":
				gameId = ws.gameId;
				userId = ws.userId;
				name = message.name;
				game = games[gameId];
				if (userId === 1) {
					game.getPlayer1().setName(name);
					if (game.getPlayer2()) {
						game.getPlayer2().send(serialize({ type: "player2Name", name }));
					}
				} else if (userId === 2) {
					game.getPlayer2().setName(name);
					if (game.getPlayer1()) {
						game.getPlayer1().send(serialize({ type: "player2Name", name }));
					}
				}
				break;
			case "move":
				gameId = ws.gameId;
				userId = ws.userId;
				game = games[gameId];
				coord = message.coord;
				game.makeMove(userId, coord.i, coord.j);
				console.log(game.getBoard());
				game.getPlayer1().send(serialize({ type: "board", board: game.getBoard() }));
				game.getPlayer2().send(serialize({ type: "board", board: game.getBoard() }));
				break;
			case "removePlayer":
				userId = ws.userId;
				gameId = ws.gameId;
				game = games[gameId];
				game.removePlayer(userId);
				ws.close();

				break;
		}
	});
});

// !SECTION ws
