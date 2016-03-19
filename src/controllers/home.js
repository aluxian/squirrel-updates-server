import {getLatestRelease} from '../components/github';
import config from '../config';

export async function main(req, res) {
  const latestRelease = await getLatestRelease();
  res.json({
    status: 'online',
    user: config.user,
    repo: config.repo,
    generatedAt: new Date(),
    latest: {
      id: latestRelease.id,
      name: latestRelease.name,
      tag_name: latestRelease.tag_name,
      published_at: latestRelease.published_at,
      body: latestRelease.body,
      assets: latestRelease.assets.map(asset => {
        return {
          id: asset.id,
          name: asset.name,
          content_type: asset.content_type,
          browser_download_url: asset.browser_download_url
        };
      })
    }
  });
}
