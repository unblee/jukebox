# jukebox

Remote audio player (on Raspberry Pi)?

# ⚠️ Caution ⚠️

`async/await`, `Fetch API`, `ES6 syntax` are used in this application.
So please use the latest version web browser.
I am checking the operation with the latest version of `chrome` and `firefox`.

# Configuration

## Environment value

|Parameter|Default|Example|Description|
|-|-|-|-|
|JUKEBOX_NO_WEB_UI|''|'yes'|If you set the value, startup with no web UI.|
|JUKEBOX_PORT|8888|3000|If you set the value, startup with the port of the set value.|

# Installation

## for Users

First, comment in `<script src="https://unpkg.com/vue/dist/vue.min.js"></script>` in `assets/index.html`.
Next, comment out `<script src="https://unpkg.com/vue"></script>` in the same file.

```console
$ export NODE_ENV=production
$ npm install
$ npm start
```

Let's access to [http://localhost:8888](http://localhost:8888)

## for Developers

```console
$ npm install
$ npm run dev // start nodemon
```

Let's access to [http://localhost:8888](http://localhost:8888)

# Currently supported providers

- [Youtube](https://www.youtube.com)

Support for other providers will come later.

# API

## Player

### Play audio

```
POST /player/start
```

#### curl command example

```console
$ curl -X POST http://localhost:8888/player/start
```

### Stop playing audio

```
POST /player/stop
```

#### curl command example

```console
$ curl -X POST http://localhost:8888/player/stop
```

### Play next audio

```
POST /player/next
```

#### curl command example

```console
$ curl -X POST http://localhost:8888/player/next
```

### Play previous audio

```
POST /player/prev
```

#### curl command example

```console
$ curl -X POST http://localhost:8888/player/prev
```

### Start one audio loop

```
POST /player/loop/one/on
```

#### curl command example

```console
$ curl -X POST http://localhost:8888/player/loop/one/on
```

### Stop one audio loop

```
POST /player/loop/one/off
```

#### curl command example

```console
$ curl -X POST http://localhost:8888/player/loop/one/off
```

### Start audio loop in the playlist

```
POST /player/loop/playlist/on
```

#### curl command example

```console
$ curl -X POST http://localhost:8888/player/loop/playlist/on
```

### Stop audio loop in the playlist

```
POST /player/loop/playlist/off
```

#### curl command example

```console
$ curl -X POST http://localhost:8888/player/loop/playlist/off
```

### Get information of the player and the playlist

```
GET /player/status
```

#### Response Body

An object of information of the player status and the playlist links.

##### example

```javascript
{
  "one_loop": false,
  "playlist_loop": false,
  "now_playing": false,
  "now_playing_idx": 0,
  "now_playing_content": null,
  "playlist": [
    {
      "provider": "youtube",
      "link": "https://youtu.be/1m53lVsc2As",
      "length_seconds": "275",
      "id": "1m53lVsc2As",
      "title": "\"Beautiful Flight\" / performed by H ZETTRIO 【Official MV】",
      "thumbnail_link": "http://i.ytimg.com/vi/1m53lVsc2As/maxresdefault.jpg"
    },
    {
      "provider": "youtube",
      "link": "https://www.youtube.com/watch?v=gjDrEdEzfQc",
      "length_seconds": "330",
      "id": "gjDrEdEzfQc",
      "title": "bohemianvoodoo \"Adria Blue\" 【Music Video】",
      "thumbnail_link": "http://i.ytimg.com/vi/gjDrEdEzfQc/maxresdefault.jpg"
    }
  ]
}
```

#### curl command example

```console
$ curl -X GET http://localhost:8888/player/status
```

## Playlist

### Add audio links to the playlist

```
POST /playlist
```

#### Request Body

An array of audio links that you want to add to the playlist.

##### example

```javascript
[
  "https://youtu.be/id1",
  "https://youtu.be/id2",
  "https://youtu.be/id3"
]
```

#### Response Body

An array of unavailable links and error messages.

##### example

```javascript
[
  {
    "link": "https://youtu.be/id1",
    "err_msg": "This link belongs to an unsupported provider"
  },
  {
    "link": "https://youtu.be/id2",
    "err_msg": "This 'provider name' link can not be played at the moment"
  }
]
```

#### curl command example

```console
$ curl -H "content-type:application/json" -X POST -d '["https://youtu.be/1m53lVsc2As","https://www.youtube.com/watch?v=gjDrEdEzfQc"]' http://localhost:8888/playlist

```

### Delete all audio links of the playlist

```
DELETE /playlist
```

#### curl command example

```console
$ curl -X DELETE http://localhost:8888/playlist
```

## Event stream from Websocket

A response of `/player/status` is delivered when some event(e.g. audio play started) occurs.

### Get connection to websocket

```
GET /socket
```
