import {getLatestRelease} from '../components/github';
import config from '../config';

export async function main(req, res) {
  const latestRelease = await getLatestRelease();
  res.json({
    status: 'online',
    user: config.user,
    repo: config.repo,
    latestRelease
  });
}
