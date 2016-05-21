// Import New Relic if it's set up
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}
require('./lib/server');
