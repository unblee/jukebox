const storeHelper = require('../../tests/helper/store_helper');

const sampleUrls = [
  'https://www.youtube.com/watch?v=P91pvMdoZ80',
  'https://www.youtube.com/watch?v=8yJZ22UZYVs',
  'https://www.youtube.com/watch?v=vn7vfza-6fQ',
  'https://www.youtube.com/watch?v=UWn-EpzxsE0',
  'https://www.youtube.com/watch?v=HLfZs-B_U6M'
];

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
      .setValue('@trackUrlField', sampleUrls.join(','))
      .submitForm('@trackSubmitButton')
      .waitForElementPresent('a.playlist-content:nth-child(5)', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(5);

    browser.pause(E2E_WAIT_TIME);

    // play music
    page
      .moveToElement('@playerBlock', 10, 10)
      .click('@playButton')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1);

    browser.pause(E2E_WAIT_TIME);

    // next music
    page
      .click('@nextButton')
      .waitForElementNotPresent('a.playlist-content:nth-child(5)', PRESENT_WAIT_TIME) // dequeue
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(1);

    browser.pause(E2E_WAIT_TIME);

    // prev music?
    page.assert.cssClassPresent('@prevButton', 'deactivate');

    // stop music
    page
      .click('@pauseButton')
      .waitForElementPresent('@playButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(1);

    browser.pause(E2E_WAIT_TIME);

    // play specified music
    page
      .click('a.playlist-content:nth-child(3)')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(3);

    browser.pause(E2E_WAIT_TIME);

    // delete current track
    page
      .click('a.playlist-content:nth-child(3) i[title=Delete]')
      .waitForElementPresent('@playButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(3)
      .assert.currentTrackNumEquals(3);

    browser.pause(E2E_WAIT_TIME);

    // clear
    page
      .click('@clearButton')
      .waitForElementNotPresent('a.playlist-content', PRESENT_WAIT_TIME)
      .assert.hasPlaylistLength(0);

    browser.pause(E2E_WAIT_TIME);
    browser.end();
  },

  oneLoopTest(browser) {
    const page = browser.page.index();

    page.navigate().waitForElementVisible('body', 1000);

    // add musics
    page
      .setValue('@trackUrlField', sampleUrls.join(','))
      .submitForm('@trackSubmitButton')
      .waitForElementPresent('a.playlist-content:nth-child(5)', 10000);

    browser.pause(E2E_WAIT_TIME);

    // set one loop mode
    page
      .click('@noLoopButton')
      .waitForElementPresent('@oneLoopButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@oneLoopButton');

    // play music
    page
      .moveToElement('@playerBlock', 10, 10)
      .click('@playButton')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1);

    browser.pause(E2E_WAIT_TIME);

    // next music
    page.click('@nextButton');
    browser.pause(2000);
    page.assert
      .elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1);

    browser.pause(E2E_WAIT_TIME);

    // prev music?
    page.assert.cssClassPresent('@prevButton', 'deactivate');

    // play specified music
    page
      .click('a.playlist-content:nth-child(3)')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(3);

    browser.pause(E2E_WAIT_TIME);

    // delete current track
    page
      .click('a.playlist-content:nth-child(3) i[title=Delete]')
      .waitForElementPresent('@playButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(3);

    browser.pause(E2E_WAIT_TIME);

    // clear
    page.click('@clearButton').waitForElementNotPresent('a.playlist-content', PRESENT_WAIT_TIME);

    browser.pause(E2E_WAIT_TIME);
    browser.end();
  },

  playlistLoopTest(browser) {
    const page = browser.page.index();

    page.navigate().waitForElementVisible('body', PRESENT_WAIT_TIME);

    // add musics
    page
      .setValue('@trackUrlField', sampleUrls.join(','))
      .submitForm('@trackSubmitButton')
      .waitForElementPresent('a.playlist-content:nth-child(5)', PRESENT_WAIT_TIME);

    browser.pause(E2E_WAIT_TIME);

    // set shuffle loop mode
    page
      // .click('@noLoopButton')   // settings of oneLoopTest are remained...
      // .waitForElementPresent('@oneLoopButton', PRESENT_WAIT_TIME)
      .click('@oneLoopButton')
      .waitForElementPresent('@playlistLoopButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playlistLoopButton');

    // play music
    page
      .moveToElement('@playerBlock', 10, 10)
      .click('@playButton')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1);

    browser.pause(E2E_WAIT_TIME);

    // next music
    page.click('@nextButton');
    browser.pause(2000);
    page.assert
      .elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(2);

    browser.pause(E2E_WAIT_TIME);

    // prev music
    page.click('@prevButton');
    browser.pause(2000);
    page.assert
      .elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1);

    browser.pause(E2E_WAIT_TIME);

    // go to last music, next and prev
    page
      .click('a.playlist-content:nth-child(5)')
      .waitForElementPresent(
        '.playlist-content:nth-child(5) .thumbnail-wrapper i',
        PRESENT_WAIT_TIME
      )
      .assert.currentTrackNumEquals(5);

    browser.pause(E2E_WAIT_TIME);

    page
      .click('@nextButton')
      .waitForElementPresent(
        '.playlist-content:nth-child(1) .thumbnail-wrapper i',
        PRESENT_WAIT_TIME
      )
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1);

    browser.pause(E2E_WAIT_TIME);

    page
      .click('@prevButton')
      .waitForElementPresent(
        '.playlist-content:nth-child(5) .thumbnail-wrapper i',
        PRESENT_WAIT_TIME
      )
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(5);

    browser.pause(E2E_WAIT_TIME);

    // clear
    page.click('@clearButton').waitForElementNotPresent('a.playlist-content', PRESENT_WAIT_TIME);

    browser.pause(E2E_WAIT_TIME);
    browser.end();
  }
};
