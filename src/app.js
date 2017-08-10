const Koa = require('koa');
const serve = require('koa-static');
const socketRoute = require('koa-route');
const mount = require('koa-mount');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const throttle = require('lodash.throttle');
const websockify = require('koa-websocket');
const favicon = require('koa-favicon');
const Event = require('events');
const Router = require('./router');
const History = require('./history');
const Playlist = require('./playlist.js');
const Player = require('./player.js');
const PlayerStatus = require('./player_status.js');
const PlayerStatusStore = require('./player_status_store.js');
const HistoryStore = require('./history_store.js');

const app = websockify(new Koa());

const ev = new Event.EventEmitter();

const playlist = new Playlist(ev);

const playerStatusStore = new PlayerStatusStore();
let playerStatus;
if (playerStatusStore.existsSync()) {
  const x = playerStatusStore.readSync();
  playlist.replace(x.playlist);
  playerStatus = new PlayerStatus(x);
} else {
  playerStatus = new PlayerStatus();
}

const historyStore = new HistoryStore();
let initialHistoryItems = [];
if (historyStore.existsSync()) {
  initialHistoryItems = historyStore.readSync();
}

const history = new History(initialHistoryItems, { maxLength: process.env.MAX_HISTORY_LENGTH });

const player = new Player(playlist, playerStatus, history, ev);

const router = new Router();
router.allBind(player, playlist, history);

// use body parser
app.use(bodyParser());

if (!process.env.JUKEBOX_NO_WEB_UI) {
  // static files
  app.use(favicon(path.join(__dirname, '../assets/favicon.ico')));
  app.use(mount('/', serve(path.join(__dirname, '../assets/'))));
}

// define broadcast function to websocket
app.ws.broadcast = data => {
  app.ws.server.clients.forEach(client => {
    if (client.readyState === 1) {
      // websocket connection is open
      client.send(data);
    }
  });
};

ev.on(
  'update-status',
  throttle(() => {
    const status = player.fetchStatus();
    app.ws.broadcast(
      JSON.stringify({
        name: 'update-status',
        data: status
      })
    );

    // save status
    playerStatusStore.writeSync(status, {
      pretty: process.env.NODE_ENV !== 'production'
    });
  }, 200)
);

history.on(
  'updated',
  throttle(() => {
    const historyData = history.toJson();
    app.ws.broadcast(
      JSON.stringify({
        name: 'update-history',
        data: historyData
      })
    );

    // save history
    historyStore.writeSync(history.toJson(), {
      pretty: process.env.NODE_ENV !== 'production'
    });
  }, 1000)
);

// websocket connection
app.ws.use(socketRoute.get('/socket', () => {}));
app.use(router.routes());
app.use(router.allowedMethods());

let port = 8888;
if (process.env.JUKEBOX_PORT) {
  port = process.env.JUKEBOX_PORT;
}

module.exports = app.listen(port);
