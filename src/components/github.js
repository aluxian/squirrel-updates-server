import GitHubApi from 'github4';
import config from '../config';

const github = new GitHubApi(config.github.api);
if (config.github.token) {
  github.authenticate({
    type: 'oauth',
    token: config.github.token
  });
}

function getReleasesByPage(page, callback) {
  github.repos.getReleases({
    user: config.user,
    repo: config.repo,
    page: page,
    per_page: 100
  }, function(err, result) {
    if (err) {
      callback(err);
    } else if (result.meta.link && result.meta.link.includes('rel="next"')) {
      getReleasesByPage(page + 1, function(err2, releases) {
        if (err2) {
          callback(err2);
        } else {
          callback(null, result.concat(releases));
        }
      });
    } else {
      callback(null, result || []);
    }
  });
}

function getLatestReleaseForChannel(channel, page, callback) {
  github.repos.getReleases({
    user: config.user,
    repo: config.repo,
    page: page
  }, function(err, releases) {
    if (err) {
      callback(err);
    } else {
      const invertedChannels = {
        dev: [],
        beta: ['dev'],
        stable: ['beta', 'dev']
      };

      const release = releases.find(release => {
        return !invertedChannels[channel].find(ic => release.name.includes(ic));
      });

      if (release) {
        callback(null, release);
      } else if (releases.meta.link && releases.meta.link.includes('rel="next"')) {
        getLatestReleaseForChannel(channel, page + 1, callback);
      } else {
        callback(null, null);
      }
    }
  });
}

export function getAllReleases() {
  return new Promise(function(resolve, reject) {
    getReleasesByPage(1, function(err, releases) {
      if (err) reject(err);
      else resolve(releases);
    });
  });
}

export function getLatestRelease(channel) {
  if (channel == 'dev') {
    return new Promise(function(resolve, reject) {
      github.repos.getLatestRelease({
        user: config.user,
        repo: config.repo
      }, function(err, result) {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  return new Promise(function(resolve, reject) {
    getLatestReleaseForChannel(channel, 1, function(err, release) {
      if (err) reject(err);
      else resolve(release);
    });
  });
}

export default github;
