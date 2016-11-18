export default {
  port: 80,
  host: '0.0.0.0',
  github: {
    token: 'a68d0454e744b2159f0b46e1c0d4e5a09572f08a',
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
  user: '4thOffice',
  repo: 'brisket',
  privateRepo: true,
  patterns: {
    darwin: {
      dmg: /\.dmg/,
      zip: /-mac\.zip/
    },
    win32: {
      installer: /\.exe/,
      zip: /-win32\.zip/
    },
    linux: {
      deb: {
        i386: /-linux-i386\.deb/,
        amd64: /\.deb/
      },
      rpm: {
        i386: /-linux-i386\.rpm/,
        x86_64: /\.rpm/
      }
    }
  },
  mirrors: process.env.MIRROR_NAMES,
  channels: ['stable', 'beta', 'alpha', 'test'],
  defaultChannel: 'stable'
};
