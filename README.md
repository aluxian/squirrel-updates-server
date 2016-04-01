# Squirrel Updates Server

A simple node.js server for Squirrel.Mac and Squirrel.Windows which uses GitHub releases. It also has an endpoint for Linux.

The server doesn't do any caching, and its responses don't include caching headers. Use a service like CloudFlare to cache requests and minimise load.

## Endpoints

### /update

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

`GET /update/win32/<file>`

It will redirect to the download url for that file. Usage:

- **Electron's AutoUpdater**: use `/update/win32`

  The AutoUpdater will request `/update/win32/RELEASES` when checking for updates, and the server will return the latest `RELEASES` file. It will also request files (e.g. `/update/win32/atom-1.4.3-delta.nupkg`), in which case the server will redirect to the correct download url on GitHub.
- **Squirrel.Windows Releasify**: use `/update/win32`

  When it will request packages (e.g. `/update/win32/atom-1.4.3-delta.nupkg`), the server will detect the version and redirect to the download url (e.g. `https://github.com/atom/atom/releases/download/v1.4.3/atom-1.4.3-delta.nupkg`)

#### Windows Portable

`GET /update/win32/portable`

It will return information about the latest Windows version.

Sample response:

```
{
  "url": "https://github.com/atom/atom/releases/download/v1.4.3/atom-windows.zip",
  "name": "1.4.3",
  "notes": "### Notable Changes\r\n\r\n* Fixed a bug that caused...",
  "pub_date": "2016-02-02T21:51:58Z",
  "version": "1.4.3"
}
```

#### Linux

`GET /update/linux?pkg=<deb|rpm>&arch=<i386|amd64|x86_64>`

It will return information about the latest Linux version.

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

### /download

#### OS X

`GET /download/darwin/latest`

Get the download url of the latest OS X release (dmg) and redirect to that url.

`GET /download/darwin/latest?zip=1`

If the `zip` query parameter is truthy, the server will redirect to the zip instead of the dmg.

#### Windows

`GET /download/win32/latest`

Get the download url of the latest Windows release (installer) and redirect to that url.

`GET /download/win32/latest?zip=1`

If the `zip` query parameter is truthy, the server will redirect to the portable zip instead of the installer.

#### Linux

`GET /download/linux/latest?pkg=<deb|rpm>&arch=<i386|amd64|x86_64>`

Get the download url of the latest Linux release, for the chosen arch and package type, and redirect to that url.

## Deploy

1. Clone the project

  ```
  git clone https://github.com/Aluxian/squirrel-updates-server.git
  cd squirrel-updates-server
  ```
2. Install dependencies

  ```
  npm install
  ```

3. Create and edit the config file

  ```
  cp src/config-example.js src/config.js
  vim src/config.js
  ```

4. Build and start

  ```
  npm run build
  npm start
  ```
