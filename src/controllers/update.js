import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';

import {getReleaseByTag, getLatestRelease, getPublicDownloadUrl} from '../components/github';
import config from '../config';
import semver from 'semver';

export async function darwin(req, res) {
  const channel = req.params.channel || config.channels[0];
  if (!config.channels.includes(channel)) throw new BadRequestError(`Invalid channel '${channel}'.`);

  const version = req.query.version;
  if (!semver.valid(version)) throw new BadRequestError(`Invalid version '${version}'.`);

  const latestRelease = await getLatestRelease(channel);
  if (!latestRelease) throw new NotFoundError('Latest release not found.');

  const latestVersion = semver.clean(latestRelease.tag_name);
  const shouldUpdate = semver.lt(version, latestVersion);

  if (shouldUpdate) {
    const asset = latestRelease.assets.find(a => a.name.match(config.patterns.darwin.zip));
    if (!asset) throw new NotFoundError(`No asset found that matches '${config.patterns.darwin.zip}'.`);

    let downloadUrl = asset.browser_download_url;
    if (config.privateRepo) {
      downloadUrl = await getPublicDownloadUrl(asset.url);
    }

    res.json({
      url: downloadUrl,
      name: latestRelease.name,
      notes: latestRelease.body,
      pub_date: latestRelease.published_at
    });

    return;
  }

  res.status(204).end();
}

export async function win32_portable(req, res) {
  const channel = req.params.channel || config.channels[0];
  if (!config.channels.includes(channel)) throw new BadRequestError(`Invalid channel '${channel}'.`);

  const latestRelease = await getLatestRelease(channel);
  if (!latestRelease) throw new NotFoundError('Latest release not found.');

  const zipAsset = latestRelease.assets.find(a => a.name.match(config.patterns.win32.zip));
  if (!zipAsset) throw new NotFoundError(`No asset found that matches '${config.patterns.win32.zip}'.`);

  let downloadUrl = zipAsset.browser_download_url;
  if (config.privateRepo) {
    downloadUrl = await getPublicDownloadUrl(zipAsset.url);
  }

  res.json({
    url: downloadUrl,
    name: latestRelease.name,
    notes: latestRelease.body,
    pub_date: latestRelease.published_at,
    version: semver.clean(latestRelease.tag_name)
  });
}

export async function win32_file(req, res) {
  const channel = req.params.channel || config.channels[0];
  if (!config.channels.includes(channel)) throw new BadRequestError(`Invalid channel '${channel}'.`);

  const fileName = req.params.file;
  if (!fileName) throw new BadRequestError(`Invalid file '${fileName}'.`);

  // Try to guess the file version
  const fileVersion = (fileName.match(/\d+\.\d+\.\d+/) || [])[0] || null;
  let release = null;

  if (fileVersion) {
    // Find the release and download from it
    release = await getReleaseByTag('v' + fileVersion);
    if (!release) throw new NotFoundError(`Release not found for version '${fileVersion}'.`);
  } else {
    // Download from the latest release
    release = await getLatestRelease(channel);
    if (!release) throw new NotFoundError('Latest release not found.');
  }

  const asset = release.assets.find(a => a.name === fileName);
  if (!asset) throw new NotFoundError('Asset not found.');

  let downloadUrl = asset.browser_download_url;
  if (config.privateRepo) {
    downloadUrl = await getPublicDownloadUrl(asset.url);
  }

  res.redirect(302, downloadUrl);
}

export async function linux(req, res) {
  const channel = req.params.channel || config.channels[0];
  if (!config.channels.includes(channel)) throw new BadRequestError(`Invalid channel '${channel}'.`);

  const arch = req.query.arch || '';
  const pkg = req.query.pkg || '';

  if (!['i386', 'amd64', 'x86_64'].includes(arch)) throw new BadRequestError(`Invalid arch '${arch}'.`);
  if (!['deb', 'rpm'].includes(pkg)) throw new BadRequestError(`Invalid pkg '${pkg}'.`);

  const latestRelease = await getLatestRelease(channel);
  if (!latestRelease) throw new NotFoundError('Latest release not found.');

  const asset = latestRelease.assets.find(a => a.name.includes(pkg) && a.name.includes(arch));
  if (!asset) throw new NotFoundError(`No asset found for pkg '${pkg}' and arch '${arch}'.`);

  let downloadUrl = asset.browser_download_url;
  if (config.privateRepo) {
    downloadUrl = await getPublicDownloadUrl(asset.url);
  }

  res.json({
    url: downloadUrl,
    name: latestRelease.name,
    notes: latestRelease.body,
    pub_date: latestRelease.published_at,
    version: semver.clean(latestRelease.tag_name)
  });
}
