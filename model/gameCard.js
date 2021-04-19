export default class GameCard {
	constructor(id, url) {
		this.id = id
		this.url = url
		this.flipped = false
	}

	flip() {
		this.flipped = !this.flipped
	}
}
