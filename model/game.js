import GameCard from "./GameCard";
import Player from "./Player";

export default class Game {
	constructor() {
		this.gameBoard = [];
		for (let i = 0; i < 8; i++) {
			let currRow = [];
			for (let j = 0; j < 4; j++) {
				currRow.push(new GameCard(0, ""));
			}
			this.gameBoard.push(currRow);
		}
		this.players = { player1: null, player2: null };
		this.turn = this.getRandInt(1, 3);
		this.gameOver = false;
		this.winner = null;
		this.generateBoard();
	}

	getPlayer1() {
		return this.players.player1;
	}

	getPlayer2() {
		return this.players.player2;
	}

	getRandInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min);
	}

	generateBoard() {
		let ids = [];
		for (let i = 0; i < 32; i++) {
			ids.push(i);
		}

		for (let i = 0; i < 16; i++) {
			let randId1 = ids[Math.floor(Math.random() * ids.length)];
			ids.splice(ids.indexOf(randId1), 1);
			let randId2 = ids[Math.floor(Math.random() * ids.length)];
			ids.splice(ids.indexOf(randId2), 1);

			let col1 = randId1 % 4,
				row1 = (randId1 - col1) / 4,
				col2 = randId2 % 4,
				row2 = (randId2 - col2) / 4;

			this.gameBoard[row1][col1].id = i;
			this.gameBoard[row2][col2].id = i;
		}
	}

	addPlayer(name, ws) {
		if (this.players.player1 === null) {
			this.players.player1 = new Player(name, ws);
		} else if (this.players.player2 === null) {
			this.players.player2 = new Player(name, ws);
		}
	}

	removePlayer(id) {
		if (id === 1) {
			this.players.player1 = null;
		} else if (id === 2) {
			this.players.player2 = null;
		}
	}

	makeMove(name, row, col) {
		let currPlayer,
			response = {};
		valid = false;
		if (this.players.player1.name === name) {
			currPlayer = this.players.player1;
			valid = this.turn === 1;
		} else if (this.players.player2.name === name) {
			currPlayer = this.players.player2;
			valid = this.turn === 2;
		}

		if (!valid) {
			return false;
		}

		this.gameBoard[row][col].flip();
		currPlayer[currPlayer.moveCount] = { row, col };
		if (!currPlayer.moveable()) {
			if (this.checkCorrect(currPlayer)) {
				currPlayer.score += 2;
				currPlayer.moveCount = 0;
				if (this.checkWin()) {
					this.response = { status: "over", winner: current };
				}
			} else {
				this.turn = this.turn === 1 ? 2 : 1;
			}
		}
	}

	checkCorrect(currPlayer) {
		let id1 = this.gameBoard[currPlayer.gameCards[0].row][currPlayer.gameCards[0].col];
		let id2 = this.gameBoard[currPlayer.gameCards[1].row][currPlayer.gameCards[1].col];

		return id1 === id2;
	}

	checkWin() {
		return this.gameBoard.every((gameCard) => gameCard.flipped === true);
	}
}
