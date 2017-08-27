/* eslint-disable func-names */

const {
  sampleUrls,
  E2E_WAIT_TIME: WAIT_TIME,
  E2E_PRESENT_WAIT_TIME: PRESENT_WAIT_TIME
} = require('../e2e_helper');

module.exports = {
  after(browser) {
    browser.end();
  },

  'Go to top page': browser => {
    browser.page.index().navigate().waitForElementVisible('body', PRESENT_WAIT_TIME);
  },

  'Set playlist loop mode': browser => {
    browser.page
      .index()
      .click('@noLoopButton')
      .waitForElementPresent('@oneLoopButton', PRESENT_WAIT_TIME)
      .click('@oneLoopButton')
      .waitForElementPresent('@playlistLoopButton', PRESENT_WAIT_TIME);
  },

  'Add musics': browser => {
    browser.page
      .index()
      .setValue('@trackUrlField', sampleUrls.join(','))
      .submitForm('@trackSubmitButton')
      .waitForElementPresent('a.playlist-content:nth-child(5)', PRESENT_WAIT_TIME);
  },

  'Open history tab': browser => {
    browser.page
      .index()
      .click('@historyTabButton')
      .waitForElementPresent('@history', PRESENT_WAIT_TIME)
      .assert.elementPresent('@history')
      .assert.elementNotPresent('@playlist')
      .api.pause(WAIT_TIME);
  },

  'Play music and play next music twice': browser => {
    browser.page
      .index()
      .moveToElement('@playerBlock', 10, 10)
      .click('@playButton')
      .waitForElementPresent('.history-content:nth-child(1)', PRESENT_WAIT_TIME)
      .click('@nextButton')
      .waitForElementPresent('.history-content:nth-child(2)', PRESENT_WAIT_TIME)
      .click('@nextButton')
      .waitForElementPresent('.history-content:nth-child(3)', PRESENT_WAIT_TIME)
      .assert.elementPresent('.history-content:nth-child(3)')
      .assert.containsText('.history-content:nth-child(1) .play-count', '1')
      .assert.containsText('.history-content:nth-child(2) .play-count', '1')
      .assert.containsText('.history-content:nth-child(3) .play-count', '1');
  },

  'Play prev music': browser => {
    browser.page
      .index()
      .click('@prevButton')
      .api.pause(WAIT_TIME)
      .page.index()
      .assert.elementPresent('.history-content:nth-child(3)')
      .assert.containsText('.history-content:nth-child(1) .play-count', '2') // sorted
      .assert.containsText('.history-content:nth-child(2) .play-count', '1')
      .assert.containsText('.history-content:nth-child(3) .play-count', '1');
  },

  'Add music from history': browser => {
    browser.page
      .index()
      .click('.history-content:nth-child(1) .add-content-button')
      .click('@playlistTabButton')
      .waitForElementPresent('@playlist', PRESENT_WAIT_TIME)
      .waitForElementPresent('a.playlist-content:nth-child(6)', PRESENT_WAIT_TIME)
      .api.pause(WAIT_TIME);
  }
};
