const Koa = require("koa");
const serve = require("koa-static");
const socket_route = require("koa-route");
const mount = require("koa-mount");
const bodyParser = require("koa-bodyparser");
const path = require("path");

const websockify = require("koa-websocket");
const app = websockify(new Koa());

const Event = require("events");
const ev = new Event.EventEmitter();

const Playlist = require("./playlist.js");
const playlist = new Playlist(ev);

const Player = require("./player.js");
const player = new Player(playlist, ev);

const Router = require("./router");
const router = new Router(player, playlist);

// use body parser
app.use(bodyParser());

if (!process.env.JUKEBOX_NO_WEB_UI) {
  // static files
  app.use(mount("/", serve(path.join(__dirname, "../assets/"))));
}

// define broadcast function to websocket
app.ws.broadcast = data => {
  for (let client of app.ws.server.clients) {
    if (client.readyState === 1) {
      // websocket connection is open
      client.send(data);
    }
  }
};

ev.on("update-status", () => {
  app.ws.broadcast(JSON.stringify(player.fetch_status()));
});

// websocket connection
app.ws.use(socket_route.get("/socket", ctx => {}));

app.use(router.routes());
app.use(router.allowedMethods());

let port = 8888;
if (process.env.JUKEBOX_PORT) {
  port = process.env.JUKEBOX_PORT;
}

app.listen(port);
