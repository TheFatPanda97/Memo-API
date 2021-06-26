import GameCard from './GameCard';
import Player from './Player';
import { getRandInt } from '../utils';

const getSvgUrl = (id) =>
  `https://raw.githubusercontent.com/TheFatPanda97/Memo-Assets/master/images/animals/${id}.svg`;

export default class Game {
  constructor() {
    this.gameBoard = [];
    for (let i = 0; i < 8; i++) {
      const currRow = [];
      for (let j = 0; j < 4; j++) {
        currRow.push(new GameCard(0, ''));
      }
      this.gameBoard.push(currRow);
    }
    this.players = { player1: null, player2: null };
    this.turn = getRandInt(1, 3);
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

  getBoard() {
    console.log('board', this.gameBoard);
    console.log('turn', this.turn);

    return this.gameBoard.map((row) => row.map(({ flipped }) => flipped));
  }

  getUrls() {
    return this.gameBoard.map((row) => row.map(({ url }) => url));
  }

  generateBoard() {
    const ids = [];
    const urlIds = [];
    for (let i = 0; i < 32; i++) {
      ids.push(i);
    }

    for (let i = 1; i <= 50; i++) {
      urlIds.push(i);
    }

    for (let i = 0; i < 16; i++) {
      const randId1 = ids[Math.floor(Math.random() * ids.length)];
      ids.splice(ids.indexOf(randId1), 1);
      const randId2 = ids[Math.floor(Math.random() * ids.length)];
      ids.splice(ids.indexOf(randId2), 1);
      const randSvgId = urlIds[Math.floor(Math.random() * urlIds.length)];
      urlIds.splice(urlIds.indexOf(randSvgId), 1);

      const col1 = randId1 % 4;
      const row1 = (randId1 - col1) / 4;
      const col2 = randId2 % 4;
      const row2 = (randId2 - col2) / 4;

      const svgUrl = getSvgUrl(randSvgId);

      this.gameBoard[row1][col1].id = i;
      this.gameBoard[row1][col1].url = svgUrl;
      this.gameBoard[row2][col2].id = i;
      this.gameBoard[row2][col2].url = svgUrl;
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

  makeMove(userId, row, col) {
    let currPlayer;
    let valid = false;

    if (userId === 1) {
      currPlayer = this.players.player1;
      valid = this.turn === 1 && currPlayer.moveCount < 2;
    } else if (userId === 2) {
      currPlayer = this.players.player2;
      valid = this.turn === 2 && currPlayer.moveCount < 2;
    }

    if (!valid) {
      return false;
    }

    this.gameBoard[row][col].flip();

    currPlayer.gameCards[currPlayer.moveCount] = { row, col };
    currPlayer.increaseMoveCount();
    return { row, col };
  }

  verify(userId) {
    const currPlayer = userId === 1 ? this.players.player1 : this.players.player2;
    let response = { type: 'nothing' };

    if (!currPlayer.moveable()) {
      if (this.checkCorrect(currPlayer)) {
        currPlayer.score += 2;
        currPlayer.moveCount = 0;

        response = { type: 'setScore' };

        if (this.checkWin()) {
          response = { type: 'over', userId: currPlayer.userId };
        }
      } else {
        this.turn = this.turn === 1 ? 2 : 1;
        currPlayer.gameCards.forEach(({ row, col }) => this.gameBoard[row][col].flip());
        currPlayer.moveCount = 0;
        response = { type: 'updateBoard', update: currPlayer.gameCards };
      }
    }

    return response;
  }

  checkCorrect(currPlayer) {
    const id1 = this.gameBoard[currPlayer.gameCards[0].row][currPlayer.gameCards[0].col].id;
    const id2 = this.gameBoard[currPlayer.gameCards[1].row][currPlayer.gameCards[1].col].id;

    console.log(id1, id2);

    return id1 === id2;
  }

  checkWin() {
    return this.gameBoard.every((gameCard) => gameCard.flipped === true);
  }
}
