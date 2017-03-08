import request from 'request';

export async function downloadMirror(url, platform, headers) {
  return new Promise(function(resolve, reject) {
    const options = {
      url: url,
      qs: {
        platform: platform
      },
      headers: headers
    };

    request(options, function(err, res) {
      if (err) {
        reject(err);
      } else {
        let json = null;

        try {
          json = JSON.parse(res.body);
        } catch (ex) {
          reject(ex);
          if (global.ravenClient && ravenClient.captureException) {
            const e2 = new Error(res.body);
            e2.res = res;
            ravenClient.captureException(e2);
          }
          console.log('could not parse mirror json:', res.body);
          json = null;
        }

        if (json) {
          resolve(json);
        }
      }
    });
  });
}
