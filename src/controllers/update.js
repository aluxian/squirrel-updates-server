import {getLatestRelease} from '../components/github';
import {getRedirect} from '../components/utils';
import config from '../config';
import semver from 'semver';

export async function darwin(req, res) {
  const channel = req.params.channel || 'stable';
  if (!['stable', 'beta', 'dev'].includes(channel)) throw new Error(`400:Invalid channel '${channel}'.`);

  const version = req.query.version;
  if (!semver.valid(version)) throw new Error(`400:Invalid version '${version}'.`);

  const latestRelease = await getLatestRelease(channel);
  if (!latestRelease) throw new Error('404:Latest release not found.');

  const latestVersion = semver.clean(latestRelease.tag_name);
  const shouldUpdate = semver.lt(version, latestVersion);

  if (shouldUpdate) {
    const asset = latestRelease.assets.find(a => a.name.match(config.patterns.darwin.zip));
    if (!asset) throw new Error(`404:No asset found that matches '${config.patterns.darwin.zip}'.`);

    let downloadUrl = asset.browser_download_url;
    if (config.privateRepo) {
      downloadUrl = await getRedirect(downloadUrl);
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
  const channel = req.params.channel || 'stable';
  if (!['stable', 'beta', 'dev'].includes(channel)) throw new Error(`400:Invalid channel '${channel}'.`);

  const latestRelease = await getLatestRelease(channel);
  if (!latestRelease) throw new Error('404:Latest release not found.');

  const zipAsset = latestRelease.assets.find(a => a.name.match(config.patterns.win32.zip));
  if (!zipAsset) throw new Error(`404:No asset found that matches '${config.patterns.win32.zip}'.`);

  let downloadUrl = zipAsset.browser_download_url;
  if (config.privateRepo) {
    downloadUrl = await getRedirect(downloadUrl);
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
  const channel = req.params.channel || 'stable';
  if (!['stable', 'beta', 'dev'].includes(channel)) throw new Error(`400:Invalid channel '${channel}'.`);

  const fileName = req.params.file;
  if (!fileName) throw new Error(`400:Invalid file '${fileName}'.`);

  const latestRelease = await getLatestRelease(channel);
  if (!latestRelease) throw new Error('404:Latest release not found.');

  let downloadPath = latestRelease.html_url
    .replace('/releases/v', '/releases/download/v')
    .replace('/releases/tag/v', '/releases/download/v');
  downloadPath += '/' + fileName;

  const versionMatches = fileName.match(/\d+\.\d+\.\d+/);
  const fileVersion = versionMatches && versionMatches[0] || null;

  if (fileVersion) {
    downloadPath = downloadPath.replace(semver.clean(latestRelease.tag_name), fileVersion);
  }

  if (config.privateRepo) {
    downloadPath = await getRedirect(downloadPath);
  }

  res.redirect(301, downloadPath);
}

export async function linux(req, res) {
  const channel = req.params.channel || 'stable';
  if (!['stable', 'beta', 'dev'].includes(channel)) throw new Error(`400:Invalid channel '${channel}'.`);

  const arch = req.query.arch || '';
  const pkg = req.query.pkg || '';

  if (!['i386', 'amd64', 'x86_64'].includes(arch)) throw new Error(`400:Invalid arch '${arch}'.`);
  if (!['deb', 'rpm'].includes(pkg)) throw new Error(`400:Invalid pkg '${pkg}'.`);

  const latestRelease = await getLatestRelease(channel);
  if (!latestRelease) throw new Error('404:Latest release not found.');

  const asset = latestRelease.assets.find(a => a.name.includes(pkg) && a.name.includes(arch));
  if (!asset) throw new Error(`404:No asset found for pkg '${pkg}' and arch '${arch}'.`);

  let downloadUrl = asset.browser_download_url;
  if (config.privateRepo) {
    downloadUrl = await getRedirect(downloadUrl);
  }

  res.json({
    url: downloadUrl,
    name: latestRelease.name,
    notes: latestRelease.body,
    pub_date: latestRelease.published_at,
    version: semver.clean(latestRelease.tag_name)
  });
}
