// SECTION API
import express from 'express';
import * as wsServer from 'ws';
import Game from './model/Game';
import { getRandInt, serialize } from './utils';

const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('hello world');
});

console.log(`listening on port ${port}`);
app.listen(port);

// !SECTION API

// SECTION ws
const wss = new wsServer.Server({ port: port + 1 });
const games = {};

const randomGameId = () => {
  let id = '0000';
  while (id in games) {
    id = ''.concat(
      getRandInt(0, 10).toString(),
      getRandInt(0, 10).toString(),
      getRandInt(0, 10).toString(),
      getRandInt(0, 10).toString(),
    );
  }
  return id;
};

wss.on('connection', (ws) => {
  console.log('new client');

  ws.on('close', () => {
    if (ws.gameId in games) {
      console.log('removing games');
      const game = games[ws.gameId];
      const player1 = game.getPlayer1();
      const player2 = game.getPlayer2();
      if (!player1 && !player2) {
        delete games[ws.gameId];
      }
    }
  });

  ws.on('message', (rawMessage) => {
    const message = JSON.parse(rawMessage);
    switch (message.type) {
      case 'init': {
        const gameId = randomGameId();
        games[gameId] = new Game(randomGameId());
        const game = games[gameId];
        ws.gameId = gameId;
        ws.userId = 1;

        game.addPlayer(message.name, ws);

        ws.send(serialize({ type: 'gameId', gameId }));

        break;
      }
      case 'join': {
        if (message.gameId in games) {
          const { gameId } = message;
          const game = games[gameId];
          ws.gameId = gameId;
          ws.userId = 2;
          const { turn } = game;
          const allUrls = game.getUrls();

          game.addPlayer(message.name, ws);

          const player1 = game.getPlayer1();
          const player2 = game.getPlayer2();

          ws.send(serialize({ type: 'gameId', gameId }));
          player1.send(serialize({ type: 'player2Name', name: message.name }));
          player2.send(serialize({ type: 'player2Name', name: player1.name }));
          player1.send(serialize({ type: 'setTurn', currTurn: turn === 1 }));
          player2.send(serialize({ type: 'setTurn', currTurn: turn === 2 }));
          player1.send(serialize({ type: 'setUrls', allUrls }));
          player2.send(serialize({ type: 'setUrls', allUrls }));
          player1.send(
            serialize({
              type: 'setScore',
              player1: player1.score,
              player2: player2.score,
            }),
          );
          player2.send(
            serialize({
              type: 'setScore',
              player1: player1.score,
              player2: player2.score,
            }),
          );
        } else {
          ws.send(serialize({ type: 'error', message: 'invalid game id' }));
          ws.close();
        }

        break;
      }
      case 'restart': {
        const { gameId } = message;
        const game = games[gameId];
        game.restart();
        const { turn } = game;
        const allUrls = game.getUrls();

        const player1 = game.getPlayer1();
        const player2 = game.getPlayer2();

        player1.send(serialize({ type: 'restart' }));
        player2.send(serialize({ type: 'restart' }));
        player1.send(serialize({ type: 'player2Name', name: player2.name }));
        player2.send(serialize({ type: 'player2Name', name: player1.name }));
        player1.send(serialize({ type: 'setTurn', currTurn: turn === 1 }));
        player2.send(serialize({ type: 'setTurn', currTurn: turn === 2 }));
        player1.send(serialize({ type: 'setUrls', allUrls }));
        player2.send(serialize({ type: 'setUrls', allUrls }));
        player1.send(
          serialize({
            type: 'setScore',
            player1: player1.score,
            player2: player2.score,
          }),
        );
        player2.send(
          serialize({
            type: 'setScore',
            player1: player1.score,
            player2: player2.score,
          }),
        );

        break;
      }
      case 'updateName': {
        const { gameId, userId } = ws;
        const { name } = message;
        const game = games[gameId];
        const player1 = game.getPlayer1();
        const player2 = game.getPlayer2();
        const desiredPlayer = userId === 1 ? player2 : player1;

        desiredPlayer.setName(name);
        desiredPlayer.send(serialize({ type: 'player2Name', name }));

        break;
      }
      case 'move': {
        const { gameId, userId } = ws;
        const game = games[gameId];
        const { coord } = message;
        const player1 = game.getPlayer1();
        const player2 = game.getPlayer2();
        const targetPlayer = userId === 1 ? player2 : player1;
        const boardUpdate = game.makeMove(userId, coord.row, coord.col);

        targetPlayer.send(serialize({ type: 'updateBoard', update: [boardUpdate] }));

        const { type, update, userId: winnerUserId } = game.verify(userId);
        const { turn } = game;
        player1.send(serialize({ type: 'setTurn', currTurn: turn === 1 }));
        player2.send(serialize({ type: 'setTurn', currTurn: turn === 2 }));

        switch (type) {
          case 'updateBoard':
            player1.send(serialize({ type: 'updateBoard', update }));
            player2.send(serialize({ type: 'updateBoard', update }));
            break;
          case 'setScore':
            player1.send(
              serialize({
                type: 'setScore',
                player1: player1.score,
                player2: player2.score,
              }),
            );
            player2.send(
              serialize({
                type: 'setScore',
                player1: player2.score,
                player2: player1.score,
              }),
            );
            break;
          case 'setWin':
            player1.send(
              serialize({
                type: 'setScore',
                player1: player1.score,
                player2: player2.score,
              }),
            );
            player2.send(
              serialize({
                type: 'setScore',
                player1: player2.score,
                player2: player1.score,
              }),
            );
            player1.send(serialize({ type: 'setWin', gameWon: winnerUserId === 1 }));
            player2.send(serialize({ type: 'setWin', gameWon: winnerUserId === 2 }));
            break;
          default:
        }

        break;
      }
      case 'removePlayer': {
        const { gameId, userId } = ws;
        const game = games[gameId];
        game.removePlayer(userId);

        ws.close();

        break;
      }
      default:
        break;
    }
  });
});

// !SECTION ws
