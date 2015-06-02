'use strict';
var CSON, attributes, boards, card_array, configuration, convert, cwd, data_dir, dataize, datestamp, day, fs, key, list_array, logger, request, res, token, url;

logger = require('../../lib/logger').Logger;

convert = require('../../lib/convert').Convert;

fs = require('fs');

request = require('sync-request');

cwd = process.env.PWD || process.cwd();

CSON = require('cson');

configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");

data_dir = cwd + "/" + configuration.cloud.trello.data_path;

day = Date.create();

datestamp = day.format('{yyyy}-{MM}-{dd}');

key = configuration.cloud.trello.key;

token = configuration.cloud.trello.token;

dataize = function(response) {
  var body, obj;
  body = response.body.toString('utf8');
  obj = JSON.parse(body);
  console.log(JSON.stringify(obj, null, ' '));
  return obj;
};

attributes = {
  board: ["id", "name", "desc", "descData", "closed", "idOrganization", "invited", "pinned", "starred", "url", "shortLink", "subscribed", "dateLastActivity", "dateLastView", "shortUrl"]
};

url = "https://trello.com/1/members/my/boards?key=" + key + "&token=" + token;

res = request("get", url);

card_array = [];

list_array = [];

boards = dataize(res);

if (boards.length > 0) {
  fs.writeFileSync(data_dir + "/" + datestamp + "_boards.csv", convert.arrayToCsv(boards, attributes.board));
}

boards.each(function(board) {
  var cards, lists;
  url = "https://trello.com/1/boards/" + board.id + "/lists?key=" + key + "&token=" + token;
  console.log(url);
  res = request("get", url);
  lists = dataize(res);
  lists.each(function(card) {
    var list_stub;
    list_stub = {
      board_id: board.id
    };
    return list_array.push(Object.merge(list_stub, Object.select(card, ["id", "closed", "dateLastActivity", "desc", "descData", "due", "email", "idBoard", "idList", "idShort", "idAttachmentCover", "manualCoverAttachment", "name", "pos", "shortLink", "shortUrl", "subscribed", "url"])));
  });
  if (list_array.length > 0) {
    fs.writeFileSync(data_dir + "/" + datestamp + "_lists.csv", convert.arrayToCsv(list_array));
    url = "https://trello.com/1/boards/" + board.id + "/lists?key=" + key + "&token=" + token;
    console.log(url);
    res = request("get", url);
    cards = dataize(res);
    cards.each(function(card) {
      var card_stub;
      card_stub = {
        board_id: board.id
      };
      return card_array.push(Object.merge(card_stub, Object.select(card, ["id", "closed", "dateLastActivity", "desc", "descData", "due", "email", "idBoard", "idList", "idShort", "idAttachmentCover", "manualCoverAttachment", "name", "pos", "shortLink", "shortUrl", "subscribed", "url"])));
    });
  }
  if (card_array.length > 0) {
    return fs.writeFileSync(data_dir + "/" + datestamp + "_cards.csv", convert.arrayToCsv(card_array));
  }
});
