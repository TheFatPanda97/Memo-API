import GameCard from "./GameCard"
import Player from "./Player"

export default class Game {
	constructor(code) {
		this.gameBoard = []
		for (let i = 0; i < 8; i++) {
			let currRow = []
			for (let j = 0; j < 4; j++) {
				currRow.push(new GameCard(0, ""))
			}
			this.gameBoard.push(currRow)
		}
		this.players = { player1: null, player2: null }
		this.turn = Math.round(Math.random())
		this.code = code
		this.gameOver = false
		this.winner = null
		this.generateBoard()
	}

	generateBoard() {
		let ids = []
		for (let i = 0; i < 32; i++) {
			ids.push(i)
		}

		for (let i = 0; i < 16; i++) {
			let randId1 = ids[Math.floor(Math.random() * ids.length)]
			ids.splice(ids.indexOf(randId1), 1)
			let randId2 = ids[Math.floor(Math.random() * ids.length)]
			ids.splice(ids.indexOf(randId2), 1)

			let col1 = randId1 % 4,
				row1 = (randId1 - col1) / 4,
				col2 = randId2 % 4,
				row2 = (randId2 - col2) / 4

			this.gameBoard[row1][col1].id = i
			this.gameBoard[row2][col2].id = i
		}
	}

	addPlayer(name) {
		if (this.players.player1 === null) {
			this.players.player1 = new Player(name)
		} else if (this.players.player2 === null) {
			this.players.player2 = new Player(name)
		}
	}

	makeMove(name, row, col) {
		let currPlayer,
			response = {}
		valid = false
		if (this.players.player1.name === name) {
			currPlayer = this.players.player1
			valid = this.turn === 1
		} else if (this.players.player2.name === name) {
			currPlayer = this.players.player2
			valid = this.turn === 2
		}

		if (!valid) {
			return false
		}

        // TODO
		this.gameBoard[row][col].flip()
		if (this.checkCorrect()) {
			response.correct = true
		}
	}

    // TODO
    checkCorrect(){
    }
}
