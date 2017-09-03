const DEFAULT_STATUS = {
  state: 'stopped',
  loopMode: 'none',
  shuffleMode: false,
  nowPlayingIdx: 0,
  volume: 1
};

const LOOP_MODES = ['none', 'one', 'playlist'];

window.store = new Vuex.Store({
  state: {
    playlist: [],
    history: [],
    status: DEFAULT_STATUS,
    seekSeconds: 0
  },
  getters: {
    nowPlayingContent(state) {
      const { status: { nowPlayingIdx: idx }, playlist } = state;
      return idx < playlist.length ? playlist[idx] : null;
    },
    nowPlayingTitle(state, getters) {
      const content = getters.nowPlayingContent;
      return content ? content.title : null;
    },
    nowPlayingLengthSeconds(state, getters) {
      const content = getters.nowPlayingContent;
      return content ? content.lengthSeconds : null;
    },
    trackCount(state) {
      return state.playlist.length;
    },
    isNowPlayingIdx: (state, getters) => index =>
      getters.nowPlayingContent && state.status.nowPlayingIdx === index,
    isPlaylistEmpty(state) {
      return state.playlist.length === 0;
    },
    existThumbnail(state, getters) {
      return getters.nowPlayingContent && getters.nowPlayingContent.thumbnailLink;
    },
    nextLoopMode(state) {
      const current = LOOP_MODES.indexOf(state.status.loopMode);
      return LOOP_MODES[(current + 1) % LOOP_MODES.length];
    }
  },
  mutations: {
    /* eslint-disable no-param-reassign */
    setStatus(state, status) {
      state.status = status;
    },
    setPlaylist(state, playlist) {
      state.playlist = playlist;
    },
    setHistory(state, items) {
      state.history = items;
    },
    setSeekSeconds(state, seekSeconds) {
      state.seekSeconds = seekSeconds;
    },
    teardown(state) {
      state.status = DEFAULT_STATUS;
      state.playlist = [];
      state.history = [];
      state.seekSeconds = 0;
    },
    moveTrack(state, { newIndex, oldIndex }) {
      const playingIndex = state.status.nowPlayingIdx;
      if (playingIndex === oldIndex) {
        state.status.nowPlayingIdx = newIndex;
      } else if (newIndex <= playingIndex && playingIndex < oldIndex) {
        state.status.nowPlayingIdx = playingIndex + 1;
      } else if (oldIndex < playingIndex && playingIndex <= newIndex) {
        state.status.nowPlayingIdx = playingIndex - 1;
      }
    }
    /* eslint-enable no-param-reassign */
  },
  actions: {
    async init({ commit }) {
      const status = await (await fetch('/player/status')).json();
      commit('setStatus', status);
      if (status.playlist) {
        commit('setPlaylist', status.playlist);
      }

      const history = await (await fetch('/history')).json();
      commit('setHistory', history);

      const { seekSeconds } = await (await fetch('/player/seek/time')).json();
      commit('setSeekSeconds', seekSeconds);
    },
    async playMusic(context, index) {
      return fetch(`/player/seek/${index}`, { method: 'POST' });
    },
    async playerStart() {
      return fetch('/player/start', { method: 'POST' });
    },
    async playerPause() {
      return fetch('/player/pause', { method: 'POST' });
    },
    async playerNext() {
      return fetch('/player/next', { method: 'POST' });
    },
    async playerPrev() {
      return fetch('/player/prev', { method: 'POST' });
    },
    async playerRestart() {
      return fetch('/player/restart', { method: 'POST' });
    },
    async togglePlayerLoopMode({ getters }) {
      return fetch(`/player/loop/${getters.nextLoopMode}`, { method: 'POST' });
    },
    async togglePlayerShuffleMode({ state }) {
      return fetch(`/player/loop/shuffle/${state.status.shuffleMode ? 'off' : 'on'}`, {
        method: 'POST'
      });
    },
    async setVolume(context, volume) {
      fetch('/player/volume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ volume })
      });
    },
    async setMute(context, isMute) {
      return fetch(`/player/volume/${isMute ? 'off' : 'on'}`, { method: 'POST' });
    },
    async addTracks(context, links) {
      return fetch('/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(links)
      });
    },
    async deleteTrack(context, index) {
      return fetch(`/playlist/${index}`, { method: 'DELETE' });
    },
    async clearPlaylist() {
      return fetch('/playlist', { method: 'DELETE' });
    },
    async moveTrack({ commit }, { newIndex, oldIndex }) {
      if (newIndex === oldIndex) {
        return;
      }
      await fetch(`/playlist/${oldIndex}/move/${newIndex}`, { method: 'POST' });

      // this is for beautiful rendering, same as server side
      commit('moveTrack', { newIndex, oldIndex });
    },
    async changeSeek(context, seekSeconds) {
      return fetch('/player/seek/time', {
        method: 'POST',
        body: JSON.stringify({ seekSeconds }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
});

// export helpers
window.mapState = Vuex.mapState;
window.mapGetters = Vuex.mapGetters;
window.mapMutations = Vuex.mapMutations;
window.mapActions = Vuex.mapActions;
