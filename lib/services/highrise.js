'use strict';
var CSON, client, configuration, convert, cwd, data_dir, datestamp, day, fs, highrise, logger;

logger = require('../../lib/logger').Logger;

convert = require('../../lib/convert').Convert;

highrise = require('node-highrise-api');

fs = require('fs');

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");

data_dir = cwd + "/" + configuration.cloud.highrise.data_path;

day = Date.create();

datestamp = day.format('{yyyy}-{MM}-{dd}');

client = new highrise({
  username: configuration.cloud.highrise.username,
  token: configuration.cloud.highrise.token
});

client.users.get(function(err, data) {
  var attributes;
  attributes = ["created_at", "id", "updated_at", "name", "email_address"];
  if (err) {
    console.log("ERROR");
    return console.log(err);
  } else {
    if (data.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_users.csv", convert.arrayToCsv(data, attributes));
    }
  }
});

client.people.get(function(err, data) {
  var attributes;
  attributes = ["author_id", "background", "company_id", "created_at", "first_name", "group_id", "id", "last_name", "owner_id", "title", "updated_at", "visible_to", "company_name", "linkedin_url", "avatar_url"];
  if (err) {
    console.log("ERROR");
    return console.log(err);
  } else {
    if (data.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_people.csv", convert.arrayToCsv(data, attributes));
    }
  }
});

client.cases.get(true, function(err, data) {
  var attributes;
  attributes = ["author_id", "background", "closed_at", "created_at", "group_id", "id", "name", "owner_id", "updated_at", "visible_to"];
  if (err) {
    console.log("ERROR");
    return console.log(err);
  } else {
    console.log(JSON.stringify(data, null, " "));
    if (data.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_cases_open.csv", convert.arrayToCsv(data, attributes));
    }
  }
});

client.cases.get(false, function(err, data) {
  var attributes;
  attributes = ["author_id", "background", "closed_at", "created_at", "group_id", "id", "name", "owner_id", "updated_at", "visible_to"];
  if (err) {
    console.log("ERROR");
    return console.log(err);
  } else {
    if (data.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_cases_closed.csv", convert.arrayToCsv(data, attributes));
    }
  }
});

client.categories.get('task', function(err, data) {
  var attributes;
  attributes = ["account_id", "color", "created_at", "elements_count", "id", "name", "updated_at"];
  if (err) {
    console.log("ERROR");
    return console.log(err);
  } else {
    console.log(JSON.stringify(data, null, " "));
    if (data.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_task_categories.csv", convert.arrayToCsv(data, attributes));
    }
  }
});

client.categories.get('deal', function(err, data) {
  var attributes;
  attributes = ["account_id", "color", "created_at", "elements_count", "id", "name", "updated_at"];
  if (err) {
    console.log("ERROR");
    return console.log(err);
  } else {
    if (data.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_deal_categories.csv", convert.arrayToCsv(data, attributes));
    }
  }
});

client.companies.get(function(err, data) {
  var attributes;
  attributes = ["author_id", "background", "created_at", "group_id", "id", "owner_id", "updated_at", "visible_to", "name", "avatar_url"];
  if (err) {
    console.log("ERROR");
    return console.log(err);
  } else {
    if (data.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_companies.csv", convert.arrayToCsv(data, attributes));
    }
  }
});

client.deals.get(function(err, data) {
  var attributes;
  attributes = ["account_id", "author_id", "background", "category_id", "created_at", "currency", "duration", "group_id", "id", "name", "owner_id", "party_id", "price", "price_type", "responsible_party-id", "status", "status_changed-on", "updated_at", "visible_to"];
  if (err) {
    console.log("ERROR");
    return console.log(err);
  } else {
    if (data.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_deals.csv", convert.arrayToCsv(data, attributes));
    }
  }
});

client.groups.get(function(err, data) {
  var attributes;
  attributes = ["created_at", "id", "updated_at", "name", "email_address"];
  if (err) {
    console.log("ERROR");
    return console.log(err);
  } else {
    console.log(JSON.stringify(data, null, " "));
    if (data.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_groups.csv", convert.arrayToCsv(data, attributes));
    }
  }
});


/*

 * Not required, admin

client.deletions.get (err, data)->
  if err
    console.log "ERROR"
    console.log err
  else
    #console.log JSON.stringify(data,null," ")          
    if data.length > 0
      fs.writeFileSync("#{data_dir}/#{datestamp}_tasks.csv", convert.arrayToCsv(data))

client.account.get (err, data)->
  if err
    console.log "ERROR"
    console.log err
  else
    #console.log JSON.stringify(data,null," ")      
    if data.length > 0
      fs.writeFileSync("#{data_dir}/#{datestamp}_tasks.csv", convert.arrayToCsv(data))

client.memberships.get (err, data)->
  if err
    console.log "ERROR"
    console.log err
  else
    #console.log JSON.stringify(data,null," ")      
    if data.length > 0
      fs.writeFileSync("#{data_dir}/#{datestamp}_tasks.csv", convert.arrayToCsv(data))
 */


/*
client.comment.get id, (err, data)->
  if err
    console.log "ERROR"
    console.log err
  else
    #console.log JSON.stringify(data,null," ")  
    if data.length > 0
      fs.writeFileSync("#{data_dir}/#{datestamp}_tasks.csv", convert.arrayToCsv(data))

client.tasks.get { type:'people', subject: "218534838"},  (err, data)->
  if err
    console.log "ERROR"
    console.log err
  else
    #console.log JSON.stringify(data,null," ")                 
    if data.length > 0
      fs.writeFileSync("#{data_dir}/#{datestamp}_tasks.csv", convert.arrayToCsv(data))

client.notes.get (err, data)->
  if err
    console.log "ERROR"
    console.log err
  else
    #console.log JSON.stringify(data,null," ")            
    if data.length > 0
      fs.writeFileSync("#{data_dir}/#{datestamp}_tasks.csv", convert.arrayToCsv(data))

client.subject_fields.get (err, data)->
  if err
    console.log "ERROR"
    console.log err
  else
    #console.log JSON.stringify(data,null," ")         
    if data.length > 0
      fs.writeFileSync("#{data_dir}/#{datestamp}_tasks.csv", convert.arrayToCsv(data))

client.tags.get (err, data)->
  if err
    console.log "ERROR"
    console.log err
  else
    #console.log JSON.stringify(data,null," ")    
    if data.length > 0
      fs.writeFileSync("#{data_dir}/#{datestamp}_tasks.csv", convert.arrayToCsv(data))
 */
