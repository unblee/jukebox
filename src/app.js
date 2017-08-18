const Koa = require('koa');
const serve = require('koa-static');
const socketRoute = require('koa-route');
const mount = require('koa-mount');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const debounce = require('lodash.debounce');
const throttle = require('lodash.throttle');
const websockify = require('koa-websocket');
const favicon = require('koa-favicon');
const Debug = require('debug');
const Router = require('./router');
const JukeBox = require('./model/jukebox');
require('dotenv').config();

const debug = {
  server: Debug('jukebox:server'),
  http: Debug('jukebox:server:http'),
  ws: Debug('jukebox:server:ws')
};

const app = websockify(new Koa());
const jukebox = new JukeBox();

// provide application objects
app.context.jukebox = jukebox;

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  debug.http(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

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
  const message = JSON.stringify(data);
  debug.ws('broadcast %s, size: %d', data.name, message.length);
  [...app.ws.server.clients]
    .filter(client => client.readyState === 1) // websocket connection is open
    .forEach(client => {
      client.send(message);
    });
};

jukebox.player.on(
  'updated-status',
  debounce(() => {
    const status = jukebox.player.serialize();
    app.ws.broadcast({
      name: 'update-status',
      data: status
    });

    jukebox.player.save();
  }, 200)
);

jukebox.history.on(
  'updated',
  debounce(() => {
    const historyData = jukebox.history.serialize();
    app.ws.broadcast({
      name: 'update-history',
      data: historyData
    });

    // save history
    jukebox.history.save();
  }, 1000)
);

jukebox.player.on(
  'updatedSeek',
  throttle(({ seekSeconds }) => {
    app.ws.broadcast(
      JSON.stringify({
        name: 'updated-seek',
        data: { seekSeconds }
      })
    );
  }, 100)
);

// websocket connection
app.ws.use(socketRoute.get('/socket', () => {}));
app.use(router.routes());
app.use(router.allowedMethods());

let port = 8888;
if (process.env.JUKEBOX_PORT) {
  port = process.env.JUKEBOX_PORT;
}

const server = app.listen(port);
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  debug.server('Listening on %s', bind);
});

module.exports = {
  app,
  server
};
