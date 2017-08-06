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
    clearButton: 'button[title="Clear Playlist"]',
    noLoopButton: 'a[title=Queue]',
    oneLoopButton: 'a[title="One Loop"]',
    playlistLoopButton: 'a[title="Playlist Loop"]'
  }
};
