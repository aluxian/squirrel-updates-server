# squirrel-updates-server

A simple node.js server for Squirrel.Mac and Squirrel.Windows which uses GitHub releases.
It also has an endpoint for Linux.

## Features

- requests to the GitHub API are cached
- the server's responses don't include caching headers
  - use a service like Cloudflare to minimise load
  - set a page rule in Cloudflare to cache every request (for e.g. 2 hours)

## Endpoints

#### Squirrel.Mac

`GET /update/darwin?version=x.x.x`

Sample response:

```
{
  "url": "https://github.com/atom/atom/releases/download/v1.4.3/atom-mac.zip",
  "name": "1.4.3",
  "notes": "### Notable Changes\r\n\r\n* Fixed a bug that caused...",
  "pub_date": "2016-02-02T21:51:58Z"
}
```

#### Squirrel.Windows

`GET /update/win32/RELEASES`

If you use this for Electron's AutoUpdater, exclude `/RELEASES` from the URL (Squirrel.Windows adds it automatically).

Sample response:

```
338F0A3FAA64963C5C208CF5D42E149924341342 https://github.com/atom/atom/releases/download/v1.4.2/atom-1.4.2-delta.nupkg 2115015
E6388792A25B1A8D1ADD8F444D4FD9122740DF7B https://github.com/atom/atom/releases/download/v1.4.2/atom-1.4.2-full.nupkg 89429249
E318ABAF1AAE36A71B53D94635FF6532F10409C6 https://github.com/atom/atom/releases/download/v1.4.3/atom-1.4.3-delta.nupkg 2172629
9AD8EF000716113BB8E1976EBC7630E3BC2E794D https://github.com/atom/atom/releases/download/v1.4.3/atom-1.4.3-full.nupkg 89442780
```

#### Linux

`GET /update/linux?pkg=<deb|rpm>&arch=<i386|amd64|x86_64>`

It will return information about the latest version.

Sample response:

```
{
  "url": "https://github.com/atom/atom/releases/download/v1.4.3/atom-amd64.deb",
  "name": "1.4.3",
  "notes": "### Notable Changes\r\n\r\n* Fixed a bug that caused...",
  "pub_date": "2016-02-02T21:51:58Z",
  "version": "1.4.3"
}
```

## Deploy

```
git clone https://github.com/Aluxian/squirrel-updates-server.git
cd squirrel-updates-server
npm install
npm run build
npm start
```
