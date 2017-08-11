module.exports = {
  url() {
    return this.api.launch_url;
  },
  elements: {
    trackUrlField: '.links-sender input',
    trackSubmitButton: '.links-sender form',
    playerBlock: '.player',
    playButton: 'a[title=Play]',
    pauseButton: 'a[title=Pause]',
    nextButton: 'a[title=Next]',
    prevButton: 'a[title=Prev]',
    openClearModalButton: 'button[title="Clear Playlist"]',
    clearModal: '.clear-playlist-modal',
    clearButton: '.clear-playlist-modal .submit-clear-button',
    noLoopButton: 'a[title=Queue]',
    oneLoopButton: 'a[title="One Loop"]',
    playlistLoopButton: 'a[title="Playlist Loop"]',
    history: '.history',
    playlist: '.playlist',
    tabs: '.tabs',
    historyTabButton: '.history-tab-button',
    playlistTabButton: '.playlist-tab-button'
  }
};
