const storeHelper = require('../../tests/helper/store_helper');
const sampleUrls = require('../../tests/helper/sample_urls');

let app;

const E2E_WAIT_TIME = Number(process.env.E2E_WAIT_TIME) || 5000;
const PRESENT_WAIT_TIME = 5000;

module.exports = {
  before() {
    storeHelper.clearStore();
    storeHelper.makeStub();
    /* eslint-disable global-require */
    app = require('../../src/app');
    /* eslint-disable global-require */
  },

  after() {
    storeHelper.clearStore();
    app.close();
  },

  basicTest(browser) {
    const page = browser.page.index();

    page.navigate().waitForElementVisible('body', PRESENT_WAIT_TIME);

    // add musics
    page
      .log('add musics')
      .setValue('@trackUrlField', sampleUrls.join(','))
      .submitForm('@trackSubmitButton')
      .waitForElementPresent('a.playlist-content:nth-child(5)', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(5)
      .api.pause(E2E_WAIT_TIME);

    // play music
    page
      .log('play music')
      .moveToElement('@playerBlock', 10, 10)
      .click('@playButton')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1)
      .api.pause(E2E_WAIT_TIME);

    // next music
    page
      .log('next music')
      .click('@nextButton')
      .waitForElementNotPresent('a.playlist-content:nth-child(5)', PRESENT_WAIT_TIME) // dequeue
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(1)
      .api.pause(E2E_WAIT_TIME);

    // prev music?
    page.log('prev music?').assert.cssClassPresent('@prevButton', 'deactivate');

    // stop music
    page
      .log('stop music')
      .click('@pauseButton')
      .waitForElementPresent('@playButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(1)
      .api.pause(E2E_WAIT_TIME);

    // play specified music
    page
      .log('play specified music')
      .click('a.playlist-content:nth-child(3)')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(3)
      .api.pause(E2E_WAIT_TIME);

    // delete current track
    page
      .log('delete current track')
      .click('a.playlist-content:nth-child(3) i[title=Delete]')
      .waitForElementPresent('@playButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(3)
      .assert.currentTrackNumEquals(3)
      .api.pause(E2E_WAIT_TIME);

    // clear
    page
      .log('clear')
      .click('@openClearModalButton')
      .waitForElementPresent('@clearModal', PRESENT_WAIT_TIME)
      .click('@clearButton')
      .waitForElementNotPresent('a.playlist-content', PRESENT_WAIT_TIME)
      .assert.hasPlaylistLength(0)
      .api.pause(E2E_WAIT_TIME);

    browser.end();
  },

  oneLoopTest(browser) {
    const page = browser.page.index();

    page.navigate().waitForElementVisible('body', 1000);

    // add musics
    page
      .log('add musics')
      .setValue('@trackUrlField', sampleUrls.join(','))
      .submitForm('@trackSubmitButton')
      .waitForElementPresent('a.playlist-content:nth-child(5)', 10000)
      .api.pause(E2E_WAIT_TIME);

    // set one loop mode
    page
      .log('set one loop mode')
      .click('@noLoopButton')
      .waitForElementPresent('@oneLoopButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@oneLoopButton')
      .api.pause(E2E_WAIT_TIME);

    // play music
    page
      .log('play music')
      .moveToElement('@playerBlock', 10, 10)
      .click('@playButton')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1)
      .api.pause(E2E_WAIT_TIME);

    // next music
    page
      .log('next music')
      .click('@nextButton')
      .api.pause(2000)
      .page.index()
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1)
      .api.pause(E2E_WAIT_TIME);

    // prev music?
    page.log('prev music?').assert.cssClassPresent('@prevButton', 'deactivate');

    // play specified music
    page
      .log('play specified music')
      .click('a.playlist-content:nth-child(3)')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(3)
      .api.pause(E2E_WAIT_TIME);

    // delete current track
    page
      .log('delete current track')
      .click('a.playlist-content:nth-child(3) i[title=Delete]')
      .waitForElementPresent('@playButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(3)
      .api.pause(E2E_WAIT_TIME);

    // clear
    page
      .log('clear')
      .click('@openClearModalButton')
      .waitForElementPresent('@clearModal', PRESENT_WAIT_TIME)
      .click('@clearButton')
      .waitForElementNotPresent('a.playlist-content', PRESENT_WAIT_TIME)
      .api.pause(E2E_WAIT_TIME);

    browser.end();
  },

  playlistLoopTest(browser) {
    const page = browser.page.index();

    page.navigate().waitForElementVisible('body', PRESENT_WAIT_TIME);

    // add musics
    page
      .log('add musics')
      .setValue('@trackUrlField', sampleUrls.join(','))
      .submitForm('@trackSubmitButton')
      .waitForElementPresent('a.playlist-content:nth-child(5)', PRESENT_WAIT_TIME)
      .api.pause(E2E_WAIT_TIME);

    // set shuffle loop mode
    page
      .log('set shuffle loop mode')
      // .click('@noLoopButton')   // settings of oneLoopTest are remained...
      // .waitForElementPresent('@oneLoopButton', PRESENT_WAIT_TIME)
      .click('@oneLoopButton')
      .waitForElementPresent('@playlistLoopButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playlistLoopButton')
      .api.pause(E2E_WAIT_TIME);

    // play music
    page
      .log('play music')
      .moveToElement('@playerBlock', 10, 10)
      .click('@playButton')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1)
      .api.pause(E2E_WAIT_TIME);

    // next music
    page
      .log('next music')
      .click('@nextButton')
      .api.pause(2000)
      .page.index()
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(2)
      .api.pause(E2E_WAIT_TIME);

    // prev music
    page
      .log('prev music')
      .click('@prevButton')
      .api.pause(2000)
      .page.index()
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1)
      .api.pause(E2E_WAIT_TIME);

    // go to last music, next and prev
    page
      .log('go to last music, next and prev')
      .click('a.playlist-content:nth-child(5)')
      .waitForElementPresent(
        '.playlist-content:nth-child(5) .thumbnail-wrapper i',
        PRESENT_WAIT_TIME
      )
      .assert.currentTrackNumEquals(5)
      .api.pause(E2E_WAIT_TIME);

    page
      .click('@nextButton')
      .waitForElementPresent(
        '.playlist-content:nth-child(1) .thumbnail-wrapper i',
        PRESENT_WAIT_TIME
      )
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1)
      .api.pause(E2E_WAIT_TIME);

    page
      .click('@prevButton')
      .waitForElementPresent(
        '.playlist-content:nth-child(5) .thumbnail-wrapper i',
        PRESENT_WAIT_TIME
      )
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(5)
      .api.pause(E2E_WAIT_TIME);

    // clear
    page
      .log('clear')
      .click('@openClearModalButton')
      .waitForElementPresent('@clearModal', PRESENT_WAIT_TIME)
      .click('@clearButton')
      .waitForElementNotPresent('a.playlist-content', PRESENT_WAIT_TIME)
      .api.pause(E2E_WAIT_TIME);

    browser.end();
  }
};
