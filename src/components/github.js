import GitHubApi from 'github4';
import config from '../config';
import request from 'request';

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
    } else {
      // Exclude drafts
      result = result && result.filter(r => !r.draft) || [];

      if (result.meta && result.meta.link && result.meta.link.includes('rel="next"')) {
        getReleasesByPage(page + 1, function(err2, releases) {
          if (err2) callback(err2);
          else callback(null, result.concat(releases));
        });
      } else {
        callback(null, result);
      }
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
      // Exclude drafts
      releases = releases && releases.filter(r => !r.draft) || [];

      const channelIndex = config.channels.indexOf(channel);
      const release = releases.find(release => {
        const releaseChannel = config.channels.find(c => release.name.includes(c)) || config.defaultChannel;
        const releaseChannelIndex = config.channels.indexOf(releaseChannel);
        return channelIndex <= releaseChannelIndex;
      });

      if (release) {
        callback(null, release);
      } else if (releases.meta && releases.meta.link && releases.meta.link.includes('rel="next"')) {
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

export function getReleaseByTag(tag) {
  return new Promise(function(resolve, reject) {
    github.repos.getReleaseByTag({
      user: config.user,
      repo: config.repo,
      tag: tag
    }, function(err, release) {
      if (err) reject(err);
      else resolve(release);
    });
  });
}

export function getLatestRelease(channel = config.channels[0]) {
  if (channel == config.channels[0]) {
    // Request the latest release directly
    return new Promise(function(resolve, reject) {
      github.repos.getLatestRelease({
        user: config.user,
        repo: config.repo
      }, function(err, release) {
        if (err) reject(err);
        else resolve(release);
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

export function getPublicDownloadUrl(url) {
  return new Promise(function(resolve, reject) {
    const options = {
      url: url,
      followRedirect: false,
      headers: {
        'Authorization': `token ${config.github.token}`,
        'Accept': 'application/octet-stream',
        'User-Agent': config.github.api.headers['user-agent']
      }
    };

    request(options, function(err, res) {
      if (err) reject(err);
      else resolve(res.headers.location);
    });
  });
}

export default github;
