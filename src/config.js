export default {
  port: process.env.UPDATES_PORT || process.env.PORT || 3000,
  host: process.env.UPDATES_HOST || '0.0.0.0',
  github: {
    token: process.env.GITHUB_TOKEN,
    api: {
      version: '3.0.0',
      headers: {
        'user-agent': 'Aluxian/squirrel-updates-server'
      }
    }
  },
  sentry: {
    dsn: process.env.SENTRY_DSN
  },
  user: process.env.REPO_OWNER || 'Aluxian',
  repo: process.env.REPO_NAME || 'Whatsie',
  privateRepo: process.env.UPDATES_PRIVATE_REPO || false,
  patterns: {
    darwin: {
      dmg: /-osx\.dmg/,
      zip: /-osx\.zip/
    },
    win32: {
      installer: /-win32-setup\.exe/,
      zip: /-win32-portable\.zip/
    },
    linux: {
      deb: {
        i386: /-linux-i386\.deb/,
        amd64: /-linux-amd64\.deb/
      },
      rpm: {
        i386: /-linux-i386\.rpm/,
        x86_64: /-linux-x86_64\.rpm/
      }
    }
  },
  mirrors: process.env.MIRROR_NAMES,
  channels: ['dev', 'beta', 'stable'],
  defaultChannel: 'stable'
};
