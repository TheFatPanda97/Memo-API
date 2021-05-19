export default class Player {
	constructor(name, ws) {
		this.name = name;
		this.score = 0;
		this.moveCount = 0;
		this.gameCards = [null, null];
		this.ws = ws;
	}

	setName(name) {
		this.name = name;
	}

	setScore(score) {
		this.score = score;
	}

	setWs(ws) {
		this.ws = ws;
	}

  send(message){
    this.ws.send(message)
  }

	increaseMoveCount() {
		this.moveCount++;
	}

	moveable() {
		return this.moveCount < 2;
	}
}
