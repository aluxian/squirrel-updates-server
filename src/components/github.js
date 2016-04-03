import GitHubApi from 'github4';
import config from '../config';

const github = new GitHubApi(config.github.api);
if (config.github.token) {
  github.authenticate({
    type: 'oauth',
    token: config.github.token
  });
}

export function getLatestRelease() {
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

export function getAllReleases() {
  return new Promise(function(resolve, reject) {
    getReleases(1, function(err, releases) {
      if (err) reject(err);
      else resolve(releases);
    });
  });
}

function getReleases(page, callback) {
  github.repos.getReleases({
    user: config.user,
    repo: config.repo,
    page: page,
    per_page: 100
  }, function(err, result) {
    if (err) {
      callback(err);
    } else if (result.meta.link && result.meta.link.includes('rel="next"')) {
      getReleases(page + 1, function(err2, releases) {
        if (err2) {
          callback(err2);
        } else {
          callback(null, result.concat(releases));
        }
      });
    } else {
      callback(null, result);
    }
  });
}

export default github;
