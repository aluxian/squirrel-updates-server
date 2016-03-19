export default {
  port: process.env.PORT || 3000,
  github: {
    token: process.env.GITHUB_TOKEN,
    api: {
      version: '3.0.0',
      headers: {
        'user-agent': 'Aluxian/squirrel-updates-server'
      }
    }
  },
  user: 'Aluxian',
  repo: 'Whatsie',
  privateRepo: false,
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
        i386: /-i386\.deb/,
        amd64: /-amd64\.deb/
      },
      rpm: {
        i386: /-i386\.rpm/,
        x86_64: /-x86_64\.rpm/
      }
    }
  }
};
