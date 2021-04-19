export default class Game {
	constructor(code) {
		this.gameBoard = []
		this.players = { player1: null, player2: null }
		this.turn = Math.round(Math.random())
		this.code = code
	}
}
