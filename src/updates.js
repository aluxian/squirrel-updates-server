import {getLatestRelease} from './github';
import request from 'request-promise';
import config from '../config';
import cache from './cache';
import semver from 'semver';

export async function darwin(req, res) {
  const version = req.query.version;

  if (!version || !semver.valid(version)) {
    throw new Error('400:Invalid version ${version}.');
  }

  const cacheValidity = 60 * 60 * 1000; // 1h
  const latestRelease = await cache.get('latest-release', getLatestRelease, cacheValidity);

  if (!latestRelease) {
    throw new Error('Latest release not found.');
  }

  const latestVersion = semver.clean(latestRelease.name);
  const shouldUpdate = semver.lt(version, latestVersion);

  if (shouldUpdate) {
    const asset = latestRelease.assets
      .find(a => a.name.match(config.darwinUpdateZipPattern));

    if (!asset) {
      throw new Error(`No asset found that matches ${config.darwinUpdateZipPattern}.`);
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
}

export async function win32_releases(req, res) {
  const cacheValidity = 60 * 60 * 1000; // 1h
  const latestRelease = await cache.get('latest-release', getLatestRelease, cacheValidity);

  if (!latestRelease) {
    throw new Error('Latest release not found.');
  }

  const releasesAsset = latestRelease.assets
    .find(a => a.name == 'RELEASES');

  if (!releasesAsset) {
    throw new Error('Asset RELEASES not found.');
  }

  let releasesFile = await request(releasesAsset.browser_download_url);
  releasesFile = releasesFile
    .replace('\n\r', '\n')
    .split('\n')
    .map(line => {
      const parts = line.split(' ');
      const version = parts[1].match(/-(\d+\.\d+\.\d+)-/)[1];

      const downloadPath = releasesAsset.browser_download_url
        .replace(semver.clean(latestRelease.name), version)
        .replace('/RELEASES', '/');

      parts[1] = downloadPath + parts[1];
      return parts.join(' ');
    })
    .join('\n');

  res.header('Content-Length', releasesFile.length);
  res.attachment('RELEASES');
  res.send(releasesFile);
}

export async function linux(req, res) {
  const arch = req.query.arch || '';
  const pkg = req.query.pkg || '';

  if (['i386', 'amd64', 'x86_64'].indexOf(arch) === -1) {
    throw new Error(`400:Invalid arch ${arch}.`);
  }

  if (['deb', 'rpm'].indexOf(pkg) === -1) {
    throw new Error(`400:Invalid pkg ${pkg}.`);
  }

  const cacheValidity = 60 * 60 * 1000; // 1h
  const latestRelease = await cache.get('latest-release', getLatestRelease, cacheValidity);

  if (!latestRelease) {
    throw new Error('Latest release not found.');
  }

  const asset = latestRelease.assets
    .find(a => a.name.includes(pkg) && a.name.includes(arch));

  if (!asset) {
    throw new Error(`No asset found for pkg ${pkg} and arch ${arch}.`);
  }

  res.json({
    url: asset.browser_download_url,
    name: latestRelease.name,
    notes: latestRelease.body,
    pub_date: latestRelease.published_at,
    version: semver.clean(latestRelease.name)
  });
}
