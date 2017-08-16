/* eslint-disable import/no-extraneous-dependencies */
const seleniumSever = require('selenium-server');
const geckoDriver = require('geckodriver');
const chromeDriver = require('chromedriver');
/* eslint-disable import/no-extraneous-dependencies */

require('dotenv').config();

const testSettings = {
  chrome: {
    desiredCapabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args: ['window-size=1280,800']
      }
    }
  },

  'chrome-headless': {
    desiredCapabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args: ['headless', 'window-size=1280,800']
      }
    }
  },

  firefox: {
    desiredCapabilities: {
      browserName: 'firefox'
    }
  }
};

module.exports = {
  src_folders: ['e2e/tests'],
  output_folder: 'e2e/reports',
  globals_path: 'e2e/global.js',
  page_objects_path: 'e2e/pages/',
  custom_assertions_path: 'e2e/custom_assertions/',
  custom_commands_path: 'e2e/custom_commands/',

  selenium: {
    start_process: true,
    server_path: seleniumSever.path,
    cli_args: {
      'webdriver.gecko.driver': geckoDriver.path,
      'webdriver.chrome.driver': chromeDriver.path
    }
  },

  test_settings: {
    default: {
      silent: true,
      launch_url: 'http://localhost:8888',
      desiredCapabilities: testSettings.chrome.desiredCapabilities
    },

    chrome: testSettings.chrome,
    'chrome-headless': testSettings['chrome-headless'],
    firefox: testSettings.firefox
  }
};
