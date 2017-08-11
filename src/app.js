const Koa = require('koa');
const serve = require('koa-static');
const socketRoute = require('koa-route');
const mount = require('koa-mount');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const throttle = require('lodash.throttle');
const websockify = require('koa-websocket');
const favicon = require('koa-favicon');
const Router = require('./router');
const JukeBox = require('./jukebox');

const app = websockify(new Koa());
const jukebox = new JukeBox();

// provide application objects
app.context.jukebox = jukebox;

const router = new Router();
router.allBind(jukebox);

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

jukebox.player.on(
  'updated-status',
  throttle(() => {
    const status = jukebox.player.fetchStatus();
    app.ws.broadcast(
      JSON.stringify({
        name: 'update-status',
        data: status
      })
    );

    jukebox.player.save();
  }, 200)
);

history.on(
  'updated',
  throttle(() => {
    const historyData = jukebox.history.toJson();
    app.ws.broadcast(
      JSON.stringify({
        name: 'update-history',
        data: historyData
      })
    );

    // save history
    jukebox.historyStore.writeSync(history.toJson(), {
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

app.listen(port);

module.exports = app;
