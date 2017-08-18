/* eslint-disable func-names */

const {
  sampleUrls,
  shortSampleUrls,
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

  'Add musics': browser => {
    browser.page
      .index()
      .log('add musics')
      .setValue('@trackUrlField', sampleUrls.join(','))
      .submitForm('@trackSubmitButton')
      .waitForElementPresent('a.playlist-content:nth-child(5)', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(5)
      .api.pause(WAIT_TIME);
  },

  'Play music': browser => {
    browser.page
      .index()
      .moveToElement('@playerBlock', 10, 10)
      .click('@playButton')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(5)
      .assert.currentTrackNumEquals(1)
      .assert.currentTitleEquals(1)
      .api.pause(WAIT_TIME);
  },

  'Play next music': browser => {
    browser.page
      .index()
      .click('@nextButton')
      .waitForElementNotPresent('a.playlist-content:nth-child(5)', PRESENT_WAIT_TIME) // dequeue
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(1)
      .assert.currentTitleEquals(1)
      .api.pause(WAIT_TIME);
  },

  'Has play prev music button?': browser => {
    browser.page.index().assert.cssClassPresent('@prevButton', 'deactivate');
  },

  'Stop music': browser => {
    browser.page
      .index()
      .click('@pauseButton')
      .waitForElementPresent('@playButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(1)
      .assert.title('jukebox')
      .api.pause(WAIT_TIME);
  },

  'Play specified music': browser => {
    browser.page
      .index()
      .click('a.playlist-content:nth-child(3)')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@pauseButton')
      .assert.hasPlaylistLength(4)
      .assert.currentTrackNumEquals(3)
      .assert.currentTitleEquals(3)
      .api.pause(WAIT_TIME);
  },

  'Delete current music': browser => {
    browser.page
      .index()
      .click('a.playlist-content:nth-child(3) i[title=Delete]')
      .waitForElementPresent('@playButton', PRESENT_WAIT_TIME)
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(3)
      .assert.currentTrackNumEquals(3)
      .assert.title('jukebox')
      .api.pause(WAIT_TIME);
  },

  'Add short music': browser => {
    browser.page
      .index()
      .setValue('@trackUrlField', shortSampleUrls[0])
      .submitForm('@trackSubmitButton')
      .waitForElementPresent('a.playlist-content:nth-child(4)', PRESENT_WAIT_TIME)
      .assert.hasPlaylistLength(4);
  },

  'Play short music': browser => {
    browser.page
      .index()
      .click('a.playlist-content:nth-child(4)')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME);
  },

  'Wait till end': browser => {
    browser.page
      .index()
      .waitForElementNotPresent(
        '.playlist-content:nth-child(4) .thumbnail-wrapper i',
        PRESENT_WAIT_TIME
      )
      .assert.elementPresent('@playButton')
      .assert.hasPlaylistLength(3);
  },

  'Clear playlist': browser => {
    browser.page
      .index()
      .click('@openClearModalButton')
      .waitForElementPresent('@clearModal', PRESENT_WAIT_TIME)
      .click('@clearButton')
      .waitForElementNotPresent('a.playlist-content', PRESENT_WAIT_TIME)
      .assert.hasPlaylistLength(0)
      .api.pause(WAIT_TIME);
  }
};
