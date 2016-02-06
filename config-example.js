module.exports = {
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
  darwinUpdateZipPattern: /-osx-update\.zip/
};
