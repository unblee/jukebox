const Koa = require("koa");
const serve = require("koa-static");
const route = require("koa-route");
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

const PlayerController = require("./controller/player_controller");
const player_controller = new PlayerController(player);

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
app.ws.use(route.get("/socket", ctx => {}));

app.use(route.post("/playlist", playlist.add()));
app.use(route.delete("/playlist", playlist.clear()));
app.use(route.delete("/playlist/:index", playlist.remove()));

app.use(
  route.get("/player/status", player_controller.status.bind(player_controller))
);
app.use(
  route.post("/player/start", player_controller.start.bind(player_controller))
);
app.use(
  route.post("/player/stop", player_controller.stop.bind(player_controller))
);
app.use(
  route.post("/player/next", player_controller.next.bind(player_controller))
);
app.use(
  route.post("/player/prev", player_controller.prev.bind(player_controller))
);
app.use(
  route.post(
    "/player/loop/one/on",
    player_controller.one_loop_on.bind(player_controller)
  )
);
app.use(
  route.post(
    "/player/loop/one/off",
    player_controller.one_loop_off.bind(player_controller)
  )
);
app.use(
  route.post(
    "/player/loop/playlist/on",
    player_controller.playlist_loop_on.bind(player_controller)
  )
);
app.use(
  route.post(
    "/player/loop/playlist/off",
    player_controller.playlist_loop_off.bind(player_controller)
  )
);

let port = 8888;
if (process.env.JUKEBOX_PORT) {
  port = process.env.JUKEBOX_PORT;
}

app.listen(port);
