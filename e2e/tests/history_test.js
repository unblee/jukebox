require('../../tests/helper');
const sampleUrls = require('../../tests/helper/sample_urls');

const E2E_WAIT_TIME = Number(process.env.E2E_WAIT_TIME) || 5000;
const PRESENT_WAIT_TIME = 5000;

module.exports = {
  historyTest(browser) {
    const page = browser.page.index();

    page.navigate().waitForElementVisible('body', PRESENT_WAIT_TIME);

    // set playlist loop mode
    page
      .log('set playlist loop mode')
      .click('@noLoopButton')
      .waitForElementPresent('@oneLoopButton', PRESENT_WAIT_TIME)
      .click('@oneLoopButton')
      .waitForElementPresent('@playlistLoopButton', PRESENT_WAIT_TIME);

    // add musics
    page
      .log('add musics')
      .setValue('@trackUrlField', sampleUrls.join(','))
      .submitForm('@trackSubmitButton')
      .waitForElementPresent('a.playlist-content:nth-child(5)', PRESENT_WAIT_TIME);

    // open history tab
    page
      .log('open history tab')
      .click('@historyTabButton')
      .waitForElementPresent('@history', PRESENT_WAIT_TIME)
      .assert.elementPresent('@history')
      .assert.elementNotPresent('@playlist')
      .api.pause(E2E_WAIT_TIME);

    // play music and next twice
    page
      .log('play music and next twice')
      .moveToElement('@playerBlock', 10, 10)
      .click('@playButton')
      .waitForElementPresent('@pauseButton', PRESENT_WAIT_TIME)
      .api.pause(E2E_WAIT_TIME)
      .page.index()
      .click('@nextButton')
      .api.pause(E2E_WAIT_TIME)
      .page.index()
      .click('@nextButton')
      .api.pause(E2E_WAIT_TIME)
      .page.index()
      .assert.elementPresent('.history-content:nth-child(3)')
      .assert.containsText('.history-content:nth-child(1) .play-count', '1')
      .assert.containsText('.history-content:nth-child(2) .play-count', '1')
      .assert.containsText('.history-content:nth-child(3) .play-count', '1');

    // prev music
    page
      .log('prev music')
      .click('@prevButton')
      .api.pause(E2E_WAIT_TIME)
      .page.index()
      .assert.elementPresent('.history-content:nth-child(3)')
      .assert.containsText('.history-content:nth-child(1) .play-count', '2') // sorted
      .assert.containsText('.history-content:nth-child(2) .play-count', '1')
      .assert.containsText('.history-content:nth-child(3) .play-count', '1');

    // add music from history
    page
      .log('add music from history')
      .click('.history-content:nth-child(1) .add-content-button')
      .click('@playlistTabButton')
      .waitForElementPresent('@playlist', PRESENT_WAIT_TIME)
      .waitForElementPresent('a.playlist-content:nth-child(6)', PRESENT_WAIT_TIME)
      .api.pause(E2E_WAIT_TIME);

    // clear and reset loop mode
    page
      .log('clear and reset loop mode')
      .click('@playlistLoopButton')
      .click('@openClearModalButton')
      .waitForElementPresent('@clearModal', PRESENT_WAIT_TIME)
      .click('@clearButton')
      .waitForElementNotPresent('a.playlist-content', PRESENT_WAIT_TIME)
      .api.pause(E2E_WAIT_TIME);

    browser.end();
  }
};
