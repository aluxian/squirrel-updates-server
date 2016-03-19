import config from '../config';

export async function main(req, res) {
  res.json({
    status: 'online',
    user: config.user,
    repo: config.repo
  });
}
