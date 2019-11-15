// Add eslint + prettier
// Problem with tilde ~
// Fix to app_id 90
// Error in PC console
// Add debug info to console
// Add readme
// Test on Mac / PC / Linux

const os = require('os');
const path = require('path');
const inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
const { exec } = require('child_process');

const getDedicatedServersList = require('./dedicated-servers-list');
const downloadSteamcmd = require('./steamcmd-downloader');

// const STEAMCMD_FOLDER_PATH = path.resolve(argv.path, './steamcmd');

inquirer
  .prompt([
    {
      type: 'input',
      name: 'dest',
      message: 'The path to the folder where the dedicated server will be deployed:',
      default: path.resolve('dedicated_server')
    },
    {
      type: 'autocomplete',
      name: 'app_id',
      message: 'Select dedicated server from list (use app_id or game name for search)',
      pageSize: 5,
      source: (answers, input) => getDedicatedServersList(input)
    },
    {
      type: 'input',
      name: 'app_set_config',
      message: 'app_set_config',
      default: (answers) => {
        const { app_id } = parseAnswer(answer);
      }
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers, null, '  '));

    // main();
  });

const parseAnswer = (answer) => {
  const splitted = answer.split('app_id:');

  return {
    game: splitted[0],
    app_id: splitted[2],
    notes: splitted[4] || null
  };
};

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
