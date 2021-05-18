const games = {};

const getRandInt = (min, max) => {
	return Math.random() * (max - min) + min;
};

const randomGameId = () => {
	let id = "0000";
	while (parseInt(id) in games) {
		id = "".concat(
			getRandInt(0, 10).toString(),
			getRandInt(0, 10).toString(),
			getRandInt(0, 10).toString(),
			getRandInt(0, 10).toString()
		);
	}
	return parseInt(id);
};