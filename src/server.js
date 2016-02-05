import Promise from 'bluebird';
import express from 'express';
import semver from 'semver';
import config from '../config';
import github, {getLatestRelease} from './github';
import cache from './cache';

const app = express();

app.get('/darwin', async (req, res) => {
  const version = req.query.version;

  if (!version || !semver.valid(version)) {
    res.status('400');
    res.json({ error: 'Invalid version.' });
    return;
  }

  try {
    const cacheValidity = 110 * 60 * 1000; // 1h50m
    const latestRelease = await cache.get('latest-release', getLatestRelease, cacheValidity);

    if (!latestRelease) {
      throw new Error('Latest release not found.');
    }

    const latestVersion = semver.clean(latestRelease.name);
    if (semver.lt(version, latestVersion)) {
      const asset = latestRelease.assets.find(a => a.name.includes('-osx-update.zip'));
      if (!asset) {
        throw new Error('Asset *-osx-update.zip not available.');
      }

      res.json({
        url: asset.browser_download_url,
        name: latestRelease.name,
        notes: latestRelease.body,
        pub_date: latestRelease.published_at
      });

      return;
    }

    res.status(204);
    res.end();
  } catch(err) {
    res.status(500);
    res.json({ error: err.message });
    console.error(err.stack);
  }
});

app.listen(config.port, () => {
  console.log('Server listening on port %s.', config.port);
});
