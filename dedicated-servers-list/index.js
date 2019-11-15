const os = require('os');
const chalk = require('chalk');

const win32DedicatedServersList = require('./win32');
const linuxDedicatedServersList = require('./linux');

module.exports = function (input) {
  input = input || '';

  const dedicatedServersList = os.platform() === 'win32' ? win32DedicatedServersList : linuxDedicatedServersList;

  // Promise and returned string just for inquirer-autocomplete-prompt source
  return new Promise(function(resolve) {
    const founded = dedicatedServersList
      .filter((server) => server['SteamCMD'] && server['Anonymous Login']) // Servers allowed from SteamCMD and Anonymous login
      .filter((server) => {
        return server['Server'].indexOf(input) !== -1 || server['ID'].indexOf(input) !== -1;
      }).map((server) => {
        let result = `${server['Server']} ${chalk.magenta('app_id:')} ${chalk.yellow(server['ID'])}`;

        if (server['Notes']) {
          result += ` ${chalk.magenta('notes:')} ${chalk.yellow(server['Notes'])}`;
        }

        return result;
      });

    resolve(founded)
  });
};
