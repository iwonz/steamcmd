/**
 * Snippet to generate JSON of available dedicated servers list
 * $0 will be on table in https://developer.valvesoftware.com/wiki/Dedicated_Servers_List
 * Was tested in Google Chrome
 */

const fields = [...$0.querySelectorAll('tr:first-child th')].map((th) => th.textContent.trim());

const games = [...$0.querySelectorAll('tr:not(:first-child)')].reduce((list, tr) => {
  const tds = [...tr.querySelectorAll('td')];
  const game = {};

  fields.forEach((field, index) => {
    game[field] = (tds[index] && tds[index].textContent.trim()) || '';
  });

  list.push(game);
  return list;
}, []);

copy(JSON.stringify(games));
