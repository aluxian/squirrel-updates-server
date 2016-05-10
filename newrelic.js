'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 *
 * Required env vars:
 * - NEW_RELIC_APP_NAME
 * - NEW_RELIC_LICENSE_KEY
 */
exports.config = {
  logging: {
    level: 'info'
  }
};
