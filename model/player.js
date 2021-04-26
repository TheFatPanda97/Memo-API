export default class Player {
	constructor(name) {
		this.name = name
		this.score = 0
        this.moveCount = 0
        this.gameCards = [null, null]
	}

	setName(name) {
		this.name = name
	}

	setScore(score) {
		this.score = score
	}

    increaseMoveCount(){
        this.moveCount++
    }

    moveable(){
        return this.moveCount < 2
    }
}
