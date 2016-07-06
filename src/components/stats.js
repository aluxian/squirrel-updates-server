import {getAllReleases} from '../components/github';
import config from '../config';

async function get() {
  const releases = await getAllReleases();

  let downloadsTotal = 0;
  let downloadsByFile = {};
  let downloadsByVersion = {};
  let downloadsByVersionR = {}; // R = real downloads, i.e. only final assets (excludes RELEASES, nupkg files, etc)
  let downloadsByVersionRD = {}; // D = calculated deltas
  let downloadsByVersionRDP = {}; // P = percentage deltas
  let downloadsByPlatform = {
    darwin: { dmg: 0, zip: 0 },
    win32: { installer: 0, portable: 0 },
    linux: {
      deb: { i386: 0, amd64: 0 },
      rpm: { i386: 0, x86_64: 0 }
    },
    undetected: 0
  };

  releases.forEach(release => {
    const version = release.tag_name;
    downloadsByVersion[version] = 0;
    downloadsByVersionR[version] = 0;

    release.assets.forEach(asset => {
      downloadsTotal += asset.download_count;
      downloadsByVersion[version] += asset.download_count;

      if (!downloadsByFile[asset.name]) downloadsByFile[asset.name] = 0;
      downloadsByFile[asset.name] += asset.download_count;

      const patterns = config.patterns;
      if (!patterns) {
        return;
      }

      if (patterns.darwin) {
        if (patterns.darwin.dmg && asset.name.match(patterns.darwin.dmg)) {
          downloadsByVersionR[version] += asset.download_count;
          downloadsByPlatform.darwin.dmg += asset.download_count;
          return;
        }

        if (patterns.darwin.zip && asset.name.match(patterns.darwin.zip)) {
          downloadsByVersionR[version] += asset.download_count;
          downloadsByPlatform.darwin.zip += asset.download_count;
          return;
        }
      }

      if (patterns.win32) {
        if (patterns.win32.installer && asset.name.match(patterns.win32.installer)) {
          downloadsByVersionR[version] += asset.download_count;
          downloadsByPlatform.win32.installer += asset.download_count;
          return;
        }

        if (patterns.win32.zip && asset.name.match(patterns.win32.zip)) {
          downloadsByVersionR[version] += asset.download_count;
          downloadsByPlatform.win32.portable += asset.download_count;
          return;
        }
      }

      if (patterns.linux && patterns.linux.deb) {
        if (patterns.linux.deb.i386 && asset.name.match(patterns.linux.deb.i386)) {
          downloadsByVersionR[version] += asset.download_count;
          downloadsByPlatform.linux.deb.i386 += asset.download_count;
          return;
        }

        if (patterns.linux.deb.amd64 && asset.name.match(patterns.linux.deb.amd64)) {
          downloadsByVersionR[version] += asset.download_count;
          downloadsByPlatform.linux.deb.amd64 += asset.download_count;
          return;
        }
      }

      if (patterns.linux && patterns.linux.rpm) {
        if (patterns.linux.rpm.i386 && asset.name.match(patterns.linux.rpm.i386)) {
          downloadsByVersionR[version] += asset.download_count;
          downloadsByPlatform.linux.rpm.i386 += asset.download_count;
          return;
        }

        if (patterns.linux.rpm.x86_64 && asset.name.match(patterns.linux.rpm.x86_64)) {
          downloadsByVersionR[version] += asset.download_count;
          downloadsByPlatform.linux.rpm.x86_64 += asset.download_count;
          return;
        }
      }

      downloadsByPlatform.undetected += asset.download_count;
    });
  });

  downloadsByPlatform.darwin.all = downloadsByPlatform.darwin.dmg + downloadsByPlatform.darwin.zip;
  downloadsByPlatform.win32.all = downloadsByPlatform.win32.installer + downloadsByPlatform.win32.portable;
  downloadsByPlatform.linux.deb.all = downloadsByPlatform.linux.deb.i386 + downloadsByPlatform.linux.deb.amd64;
  downloadsByPlatform.linux.rpm.all = downloadsByPlatform.linux.rpm.i386 + downloadsByPlatform.linux.rpm.x86_64;
  downloadsByPlatform.linux.all = downloadsByPlatform.linux.deb.all + downloadsByPlatform.linux.rpm.all;
  downloadsByPlatform.all = downloadsByPlatform.darwin.all + downloadsByPlatform.win32.all + downloadsByPlatform.linux.all;

  const versionsDesc = Object.keys(downloadsByVersionR);
  for (let i = 0; i < versionsDesc.length - 1; i++) {
    let deltaCount = downloadsByVersionR[versionsDesc[i]] - downloadsByVersionR[versionsDesc[i+1]];
    let deltaPercent = deltaCount / downloadsByVersionR[versionsDesc[i+1]] * 100;
    deltaPercent = Math.round(deltaPercent * 100) / 100;
    downloadsByVersionRD[versionsDesc[i]] = deltaCount;
    downloadsByVersionRDP[versionsDesc[i]] = deltaPercent;
  }
  downloadsByVersionRD[versionsDesc[versionsDesc.length - 1]] = 0;
  downloadsByVersionRDP[versionsDesc[versionsDesc.length - 1]] = 0;

  return {
    total: downloadsTotal,
    platforms_r: downloadsByPlatform,
    versions: downloadsByVersion,
    versions_r: downloadsByVersionR,
    versions_rd: downloadsByVersionRD,
    versions_rdp: downloadsByVersionRDP,
    files: downloadsByFile
  };
}

export default {
  get
};
