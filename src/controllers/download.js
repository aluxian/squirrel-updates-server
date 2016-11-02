import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';

import {downloadMirror} from '../components/mirrors';
import {getLatestRelease, getPublicDownloadUrl} from '../components/github';
import config from '../config';

export async function latest(req, res) {
  const platform = req.params.platform;
  if (!['darwin', 'win32', 'linux'].includes(platform)) throw new BadRequestError(`Invalid platform '${platform}'.`);

  const preferZip = req.query.zip; // darwin or win32
  const arch = req.query.arch;
  const pkg = req.query.pkg;

  if (platform === 'linux') {
    if (!['i386', 'amd64', 'x86_64'].includes(arch)) throw new BadRequestError(`Invalid arch '${arch}'.`);
    if (!['deb', 'rpm'].includes(pkg)) throw new BadRequestError(`Invalid pkg '${pkg}'.`);
  }

  const latestRelease = await getLatestRelease();
  if (!latestRelease) throw new NotFoundError('Latest release not found.');

  let asset = null;
  let pattern = null;

  switch (platform) {
    case 'darwin':
      pattern = preferZip ? config.patterns.darwin.zip : config.patterns.darwin.dmg;
      break;

    case 'win32':
      pattern = preferZip ? config.patterns.win32.zip : config.patterns.win32.installer;
      break;

    case 'linux':
      pattern = config.patterns.linux[pkg][arch];
      break;
  }

  asset = latestRelease.assets.find(a => a.name.match(pattern));
  if (!asset) throw new NotFoundError(`No asset found that matches '${pattern}'.`);

  let downloadUrl = asset.browser_download_url;
  if (config.privateRepo) {
    downloadUrl = await getPublicDownloadUrl(asset.url);
  }

  res.redirect(302, downloadUrl);
}

export async function latestMirror(req, res) {
  const mirror = req.params.mirror;
  const mirrors = (config.mirrors || '').split(',');
  if (!mirrors.includes(mirror)) throw new NotFoundError(`Mirror '${mirror}' not found.`);

  const platform = req.query.platform;
  if (!['darwin', 'win32'].includes(platform)) throw new BadRequestError(`Invalid platform '${platform}'.`);

  const mirrorUrl = process.env['MIRROR_URL_' + mirror.toUpperCase()];
  const headers = {
    'x-forwarded-for': req.get('x-forwarded-for') || req.connection.remoteAddress,
    'user-agent': req.get('user-agent')
  };
  const response = await downloadMirror(mirrorUrl, platform, headers);

  res.redirect(302, response.download_link);
}
