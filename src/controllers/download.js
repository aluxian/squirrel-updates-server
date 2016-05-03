import {getLatestRelease, getPublicDownloadUrl} from '../components/github';
import config from '../config';

export async function latest(req, res) {
  const platform = req.params.platform;
  if (!['darwin', 'win32', 'linux'].includes(platform)) throw new Error(`400:Invalid platform '${platform}'.`);

  const preferZip = req.query.zip; // darwin or win32
  const arch = req.query.arch;
  const pkg = req.query.pkg;

  if (platform === 'linux') {
    if (!['i386', 'amd64', 'x86_64'].includes(arch)) throw new Error(`400:Invalid arch '${arch}'.`);
    if (!['deb', 'rpm'].includes(pkg)) throw new Error(`400:Invalid pkg '${pkg}'.`);
  }

  const latestRelease = await getLatestRelease();
  if (!latestRelease) throw new Error('404:Latest release not found.');

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
  if (!asset) throw new Error(`404:No asset found that matches '${pattern}'.`);

  let downloadUrl = asset.browser_download_url;
  if (config.privateRepo) {
    downloadUrl = await getPublicDownloadUrl(asset.url);
  }

  res.redirect(301, downloadUrl);
}
