'use strict';
var CSON, Harvest, TimeTracking, clients, configuration, convert, cwd, data_dir, datestamp, day, fs, harvest, logger;

CSON = require('cson');

logger = require('../../lib/logger').Logger;

convert = require('../../lib/convert').Convert;

fs = require('fs');

Harvest = require('harvest');

cwd = process.env.PWD || process.cwd();

configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");

data_dir = cwd + "/" + configuration.cloud.harvest.data_path;

day = Date.create();

datestamp = day.format('{yyyy}-{MM}-{dd}');

harvest = new Harvest({
  subdomain: configuration.cloud.harvest.subdomain,
  email: configuration.cloud.harvest.email,
  password: configuration.cloud.harvest.password
});

clients = harvest.Clients;

clients.list({}, function(err, clients) {
  var fixed_clients;
  if (err) {
    return console.log("CLIENTS ERROR");
  } else {
    fixed_clients = [];
    clients.each(function(object) {
      return fixed_clients.push(object.client);
    });
    if (fixed_clients.length > 0) {
      console.log(JSON.stringify(fixed_clients, null, " "));
      return fs.writeFileSync(data_dir + "/" + datestamp + "_clients.csv", convert.arrayToCsv(fixed_clients));
    }
  }
});

harvest.Projects.list({}, function(err, projects) {
  var fixed_projects;
  if (err) {
    return console.log("ERROR");
  } else {
    fixed_projects = [];
    projects.each(function(object) {
      return fixed_projects.push(object.project);
    });
    if (fixed_projects.length > 0) {
      console.log(JSON.stringify(fixed_projects, null, " "));
      return fs.writeFileSync(data_dir + "/" + datestamp + "_projects.csv", convert.arrayToCsv(fixed_projects));
    }
  }
});

harvest.Tasks.list({}, function(err, tasks) {
  var fixed_tasks;
  if (err) {
    return console.log("ERROR");
  } else {
    fixed_tasks = [];
    tasks.each(function(object) {
      return fixed_tasks.push(object.task);
    });
    if (fixed_tasks.length > 0) {
      console.log(JSON.stringify(fixed_tasks, null, " "));
      return fs.writeFileSync(data_dir + "/" + datestamp + "_tasks.csv", convert.arrayToCsv(fixed_tasks));
    }
  }
});

harvest.ClientContacts.list({}, function(err, contacts) {
  var fixed_contacts;
  if (err) {
    return console.log("ERROR");
  } else {
    fixed_contacts = [];
    contacts.each(function(object) {
      return fixed_contacts.push(object.contact);
    });
    if (fixed_contacts.length > 0) {
      console.log(JSON.stringify(fixed_contacts, null, " "));
      return fs.writeFileSync(data_dir + "/" + datestamp + "_client_contacts.csv", convert.arrayToCsv(fixed_contacts));
    }
  }
});

harvest.ExpenseCategories.list({}, function(err, expense_categories) {
  var fixed_expense_categories;
  if (err) {
    return console.log("ERROR");
  } else {
    fixed_expense_categories = [];
    expense_categories.each(function(object) {
      return fixed_expense_categories.push(object.expense_category);
    });
    if (fixed_expense_categories.length > 0) {
      console.log(JSON.stringify(fixed_expense_categories, null, " "));
      return fs.writeFileSync(data_dir + "/" + datestamp + "_expense_categories.csv", convert.arrayToCsv(fixed_expense_categories));
    }
  }
});

harvest.InvoiceCategories.list({}, function(err, invoice_categories) {
  var fixed_invoice_categories;
  if (err) {
    return console.log("ERROR");
  } else {
    fixed_invoice_categories = [];
    invoice_categories.each(function(object) {
      return fixed_invoice_categories.push(object.invoice_category);
    });
    if (fixed_invoice_categories.length > 0) {
      console.log(JSON.stringify(fixed_invoice_categories, null, " "));
      return fs.writeFileSync(data_dir + "/" + datestamp + "_invoice_categories.csv", convert.arrayToCsv(fixed_invoice_categories));
    }
  }
});

harvest.People.list({}, function(err, people) {
  var fixed_people;
  if (err) {
    return console.log("ERROR");
  } else {
    fixed_people = [];
    people.each(function(object) {
      return fixed_people.push(object.user);
    });
    if (fixed_people.length > 0) {
      console.log(JSON.stringify(fixed_people, null, " "));
      return fs.writeFileSync(data_dir + "/" + datestamp + "_people.csv", convert.arrayToCsv(fixed_people));
    }
  }
});

harvest.Invoices.list({}, function(err, invoices) {
  var fixed_invoice_messages, fixed_invoice_payments, fixed_invoices;
  if (err) {
    return console.log("ERROR");
  } else {
    fixed_invoices = [];
    fixed_invoice_messages = [];
    fixed_invoice_payments = [];
    console.log(JSON.stringify(invoices, null, " "));
    invoices.each(function(object) {
      return fixed_invoices.push(object.invoices);

      /*
      harvest.InvoiceMessages.messagesByInvoice {invoice_id: object.invoices.id}, (err, invoice_messages)->
        if (err)
          console.log "InvoiceMessages ERROR"
          console.log err
        else
          
      
          invoice_messages.each (object)->
            fixed_invoice_messages.push object.message  
      
      
      harvest.InvoicePayments.paymentsByInvoice {invoice_id: object.invoices.id}, (err, invoice_payments)->
        if (err)
          console.log "InvoicePayments ERROR"
          console.log err
        else
          
          
          invoice_payments.each (object)->
            fixed_invoice_payments.push object.payment
       */
    });
    console.log("fixed_invoice_payments");
    console.log(JSON.stringify(fixed_invoice_payments, null, " "));
    if (fixed_invoice_payments.length > 0) {
      fs.writeFileSync(data_dir + "/" + datestamp + "_invoice_payments.csv", convert.arrayToCsv(fixed_invoice_payments));
    }
    console.log("fixed_invoice_messages");
    console.log(JSON.stringify(fixed_invoice_messages, null, " "));
    if (fixed_invoice_messages.length > 0) {
      fs.writeFileSync(data_dir + "/" + datestamp + "_invoice_messages.csv", convert.arrayToCsv(fixed_invoice_messages));
    }
    if (fixed_invoices.length > 0) {
      console.log(JSON.stringify(fixed_invoices, null, " "));
      return fs.writeFileSync(data_dir + "/" + datestamp + "_invoices.csv", convert.arrayToCsv(fixed_invoices));
    }
  }
});

TimeTracking = harvest.TimeTracking;


/*

  Logic
  - dimensions
    - get clients
    - get people
    - get projects
    - get expense categories
    - get invoice categories
    - get invoice messages
    - get invoice payments
    
    - facts
      get invoices
      iterate projects
        - get all time
        - get all expenses
    
  -
 */
