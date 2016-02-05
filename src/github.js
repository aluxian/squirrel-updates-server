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

export default github;
