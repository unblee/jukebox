const Koa = require('koa');
const serve = require('koa-static');
const socket_route = require('koa-route');
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

const player_status_store = new PlayerStatusStore();
if (player_status_store.exists_sync()) {
  player.set_status(player_status_store.read_sync());
}

const Router = require('./router');

const router = new Router();
router.all_bind(player, playlist);

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
    const status = player.fetch_status();
    app.ws.broadcast(JSON.stringify(status));

    // save status
    player_status_store.write_sync(status, {
      pretty: process.env.NODE_ENV !== 'production'
    });
  }, 200),
);

// websocket connection
app.ws.use(socket_route.get('/socket', () => {}));

app.use(router.routes());
app.use(router.allowedMethods());

let port = 8888;
if (process.env.JUKEBOX_PORT) {
  port = process.env.JUKEBOX_PORT;
}

app.listen(port);
