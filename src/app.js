const Koa = require('koa');
const serve = require('koa-static');
const socketRoute = require('koa-route');
const mount = require('koa-mount');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const throttle = require('lodash.throttle');

const websockify = require('koa-websocket');

const app = websockify(new Koa());

const Event = require('events');

const ev = new Event.EventEmitter();

const Playlist = require('./playlist.js');

const playlist = new Playlist(ev);

const Player = require('./player.js');

const player = new Player(playlist, ev);

// load status
const PlayerStatusStore = require('./player_status_store.js');

const playerStatusStore = new PlayerStatusStore();
if (playerStatusStore.existsSync()) {
  player.setStatus(playerStatusStore.readSync());
}

const Router = require('./router');

const router = new Router();
router.allBind(player, playlist);

// use body parser
app.use(bodyParser());

if (!process.env.JUKEBOX_NO_WEB_UI) {
  // static files
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
    app.ws.broadcast(JSON.stringify(status));

    // save status
    playerStatusStore.writeSync(status, {
      pretty: process.env.NODE_ENV !== 'production'
    });
  }, 200)
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
