const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const unzip = require('unzip');
const os = require('os');
const gunzip = require('gunzip-maybe');
const tar = require('tar-fs');
const rimraf = require('rimraf');

const STEAMCMD_WIN32_URL = 'http://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';
const STEAMCMD_OSX_URL = 'http://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz';
const STEAMCMD_LINUX_URL = 'http://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz';

module.exports = function (steamcmdFolderPath) {
  return new Promise((resolve, reject) => {
    const archivePath = path.resolve(steamcmdFolderPath, 'archive');

    fs.ensureDirSync(steamcmdFolderPath);

    let downloadUrl;
    let unzipPipe;

    switch (os.platform()) {
      case 'win32': // WIN
        downloadUrl = STEAMCMD_WIN32_URL;
        unzipPipe = unzip.Extract({ path: steamcmdFolderPath });
        break;
      case 'darwin': // OSX
        downloadUrl = STEAMCMD_OSX_URL;
        unzipPipe = tar.extract(steamcmdFolderPath);
        break;
      case 'freebsd': // Others
      case 'linux':
      case 'sunos':
        downloadUrl = STEAMCMD_LINUX_URL;
        unzipPipe = tar.extract(steamcmdFolderPath);
        break;
    }

    const archiveFile = fs.createWriteStream(archivePath).on('finish', () => {
      fs.createReadStream(archivePath)
        .pipe(gunzip())
        .pipe(unzipPipe).on('finish', () => {
          fixAppManifestBug();

          resolve();
        });
    }).on('error', reject);

    http.get(downloadUrl).on('response', (response) => response.pipe(archiveFile)).on('error', reject);
  });
};

// Remove this code someday
function fixAppManifestBug() {
  if (argv.app_id !== 90) { return; }

  const HLDM_MANIFEST_PATH = path.resolve('./HLDS-appmanifest/HalfLifeDeathmatch');

  const HLDS_MANIFEST_PATH = {
    cstrike: path.resolve('./HLDS-appmanifest/CounterStrike'),
    czero: path.resolve('./HLDS-appmanifest/CounterStrikeConditionZero'),
    dmc: path.resolve('./HLDS-appmanifest/DeathmatchClassic'),
    dod: path.resolve('./HLDS-appmanifest/DayOfDefeat'),
    gearbox: path.resolve('./HLDS-appmanifest/OpposingForce'),
    ricochet: path.resolve('./HLDS-appmanifest/Ricochet'),
    tfc: path.resolve('./HLDS-appmanifest/TeamFortressClassic')
  };

  const steamApsFolderPath = path.resolve(argv.path, './steamapps');

  fs.ensureDirSync(steamApsFolderPath);
  rimraf.sync(steamApsFolderPath);

  if (!argv.app_set_config) {
    fs.copySync(HLDM_MANIFEST_PATH, steamApsFolderPath);
    return;
  }

  const appSetConfigArr = argv.app_set_config.split(' ');

  Object.keys(HLDS_MANIFEST_PATH).forEach((key) => {
    if (appSetConfigArr.includes(key)) {
      fs.copySync(HLDS_MANIFEST_PATH[key], steamApsFolderPath);
    }
  });
}
