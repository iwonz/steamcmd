// Add eslint + prettier
// Rebuild with Vorpal as CLI https://github.com/dthree/vorpal
// Problem with tilde ~
// Fix to app_id 90
// Error in PC console
// Add debug info to console
// Add readme
// Test on Mac / PC / Linux

const os = require('os');
const path = require('path');
const { exec } = require('child_process');

const argv = require('yargs')
  .option('path', {
    type: 'string',
    description: 'The path to the folder where the dedicated server will be deployed'
  })
  .option('app_id', {
    type: 'number',
    description: 'Dedicated server app_id from https://developer.valvesoftware.com/wiki/Dedicated_Servers_List',
    default: 90 // Counter-Strike 1.6
  })
  .option('app_set_config', {
    type: 'string',
    description: 'Additional config to HLDS modes (see examples here https://developer.valvesoftware.com/wiki/Dedicated_Servers_List)',
    default: 'mod cstrike' // Counter-Strike 1.6
  })
  .demandOption(['path'])
  .argv;

const downloadSteamcmd = require('./steamcmd-downloader');

const STEAMCMD_FOLDER_PATH = path.resolve(argv.path, './steamcmd');

const getCommand = () => {
  const isWin32 = os.platform() === 'win32';

  const dest = path.resolve(argv.path, './dedicated_server');
  const scriptPath = path.resolve(STEAMCMD_FOLDER_PATH, isWin32 ? './steamcmd.exe' : './steamcmd.sh');
  const executable = `${isWin32 ? 'start' : 'sudo'} ${scriptPath}`;

  const appSetConfig = argv.app_set_config ? `+app_set_config "${argv.app_id} ${argv.app_set_config}"` : '';

  return `${executable} +login anonymous +force_install_dir ${dest} +app_update ${argv.app_id} ${appSetConfig} validate +quit`;
};

async function main() {
  await downloadSteamcmd(STEAMCMD_FOLDER_PATH);

  exec(getCommand(), (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
};

main();
