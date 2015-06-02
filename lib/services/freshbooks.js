'use strict';
var CSON, FreshBooks, api_token, api_url, attributes, category, cleanedArrayAttribute, client, configuration, convert, cwd, data_dir, datestamp, day, estimate, estimate_lines, expense, freshbooks, fs, invoice, invoice_lines, item, language, logger, payment, project, recurring, recurring_lines, staff, task, tax, time_entry;

logger = require('../../lib/logger').Logger;

convert = require('../../lib/convert').Convert;

FreshBooks = require("freshbooks");

CSON = require('cson');

fs = require('fs');

cwd = process.env.PWD || process.cwd();

configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");

data_dir = cwd + "/" + configuration.cloud.freshbooks.data_path;

api_url = configuration.cloud.freshbooks.api_url;

api_token = configuration.cloud.freshbooks.api_token;

freshbooks = new FreshBooks(api_url, api_token);

cleanedArrayAttribute = function(stringArray) {
  var values;
  if (stringArray.length > 0) {
    values = stringArray.split('\n').map(function(object) {
      return object.trim();
    });
    values.remove('');
    return values;
  } else {
    return [];
  }
};

attributes = {
  client: ["client_id", "first_name", "email", "username", "home_phone", "mobile", "organization", "work_phone", "fax", "vat_name", "vat_number", "p_street1", "p_street2", "p_city", "p_state", "p_country", "p_code", "s_street1", "s_street2", "s_city", "s_state", "s_country", "s_code", "notes", "language", "currency_code", "folder", "updated", "credit"],
  project: ["project_id", "name", "description", "rate", "bill_method", "client_id", "project_manager_id", "external", "budget"],
  estimate: ["estimate_id", "number", "staff_id", "client_id", "contact_id", "organization", "first_name", "last_name", "p_street1", "p_street2", "p_city", "p_state", "p_country", "p_code", "po_number", "status", "amount", "date", "notes", "terms", "discount", "language", "currency_code", "vat_name", "vat_number", "folder"],
  invoice: ["invoice_id", "number", "client_id", "contact_id", "recurring_id", "organization", "first_name", "last_name", "p_street1", "p_street2", "p_city", "p_state", "p_country", "p_code", "po_number", "status", "amount", "amount_outstanding", "paid", "date", "notes", "terms", "discount", "return_uri", "updated", "currency_code", "language", "vat_name", "vat_number", "folder", "staff_id"],
  recurring: ["recurring_id", "number", "client_id", "contact_id", "recurring_id", "organization", "first_name", "last_name", "p_street1", "p_street2", "p_city", "p_state", "p_country", "p_code", "po_number", "status", "amount", "amount_outstanding", "paid", "date", "notes", "terms", "discount", "return_uri", "updated", "currency_code", "language", "vat_name", "vat_number", "folder", "staff_id"],
  staff: ["username", "first_name", "last_name", "email", "business_phone", "mobile_phone", "home_phone", "fax", "rate", "last_login", "number_of_logins", "signup_date", "street1", "street2", "city", "state", "country", "code", "notes", "staff_id"]
};

day = Date.create();

datestamp = day.format('{yyyy}-{MM}-{dd}');

client = new freshbooks.Client();

client.list({}, function(err, clients) {
  var client_output, targetPath;
  if (err != null) {
    console.log("invoice list error");
    return console.log(err);
  } else {
    client_output = convert.arrayToCsv(clients, attributes.client);
    console.log(client_output);
    targetPath = data_dir + "/" + datestamp + "_clients.csv";
    return fs.writeFileSync(targetPath, client_output);
  }
});

project = new freshbooks.Project();

project.list({}, function(err, projects) {
  var resources, tasks;
  if (err != null) {
    console.log("project list error");
    return console.log(err);
  } else {
    resources = [];
    tasks = [];
    projects.each(function(project) {
      project.budget = project.budget.trim();
      project.contractors = cleanedArrayAttribute(project.contractors);
      project.staff = cleanedArrayAttribute(project.staff);
      if (project.contractors.length > 0) {
        project.contractors.each(function(contractor) {
          return resources.push({
            project_id: project.project_id,
            staff_id: null,
            contractor_id: contractor
          });
        });
      }
      if (project.staff.length > 0) {
        project.staff.each(function(staff) {
          return resources.push({
            project_id: project.project_id,
            staff_id: staff,
            contractor_id: null
          });
        });
      }
      if (project.tasks.length > 0) {
        return project.tasks.each(function(task) {
          return tasks.push({
            project_id: project.project_id,
            task_id: task.task_id,
            rate: task.rate
          });
        });
      }
    });
    if (projects.length > 0) {
      fs.writeFileSync(data_dir + "/" + datestamp + "_projects.csv", convert.arrayToCsv(projects, attributes.project));
    }
    if (resources.length > 0) {
      fs.writeFileSync(data_dir + "/" + datestamp + "_resources.csv", convert.arrayToCsv(resources));
    }
    if (tasks.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_tasks.csv", convert.arrayToCsv(tasks));
    }
  }
});

category = new freshbooks.Category();

category.list({}, function(err, categories) {
  if (err != null) {
    console.log("category list error");
    return console.log(err);
  } else {
    if (categories.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_expense_categories.csv", convert.arrayToCsv(categories));
    }
  }
});

estimate = new freshbooks.Estimate();

estimate_lines = [];

estimate.list({}, function(err, estimates) {
  if (err != null) {
    console.log("estimate list error");
    return console.log(err);
  } else {
    estimates.each(function(estimate) {
      console.log("estimate id: " + estimate.estimate_id);
      return estimate.lines.each(function(line) {
        return estimate_lines.push(Object.merge({
          estimate_id: estimate.estimate_id
        }, line));
      });
    });
    console.log("estimate lines");
    console.log(JSON.stringify(estimate_lines, null, '\t'));
    console.log;
    console.log("estimates");
    console.log(JSON.stringify(estimates, null, '\t'));
    if (estimates.length > 0) {
      fs.writeFileSync(data_dir + "/" + datestamp + "_estimates.csv", convert.arrayToCsv(estimates, attributes.estimate));
    }
    if (estimate_lines.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_estimate_line_items.csv", convert.arrayToCsv(estimate_lines));
    }
  }
});

expense = new freshbooks.Expense();

expense.list({}, function(err, expenses) {
  if (err != null) {
    console.log("expense list error");
    return console.log(err);
  } else {
    if (expenses.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_expenses.csv", convert.arrayToCsv(expenses));
    }
  }
});

invoice = new freshbooks.Invoice();

invoice_lines = [];

invoice.list({}, function(err, invoices) {
  if (err != null) {
    console.log("invoice list error");
    return console.log(err);
  } else {
    invoices.each(function(invoice) {
      console.log("invoice id: " + invoice.invoice_id);
      return invoice.lines.each(function(line) {
        return invoice_lines.push(Object.merge({
          invoice_id: invoice.invoice_id
        }, line));
      });
    });
    if (invoices.length > 0) {
      fs.writeFileSync(data_dir + "/" + datestamp + "_invoices.csv", convert.arrayToCsv(invoices, attributes.invoice));
    }
    if (invoice_lines.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_invoice_line_items.csv", convert.arrayToCsv(invoice_lines));
    }
  }
});

item = new freshbooks.Item();

item.list({}, function(err, items) {
  if (err != null) {
    console.log("item list error");
    return console.log(err);
  } else {
    if (items.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_items.csv", convert.arrayToCsv(items));
    }
  }
});

language = new freshbooks.Language();

language.list({}, function(err, languages) {
  if (err != null) {
    console.log("language list error");
    return console.log(err);
  } else {
    if (languages.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_languages.csv", convert.arrayToCsv(languages));
    }
  }
});

staff = new freshbooks.Staff();

staff.list({}, function(err, people) {
  if (err != null) {
    console.log("staff list error");
    return console.log(err);
  } else {
    if (people.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_staff.csv", convert.arrayToCsv(people, attributes.staff));
    }
  }
});

payment = new freshbooks.Payment();

payment.list({}, function(err, payments) {
  if (err != null) {
    console.log("payment list error");
    return console.log(err);
  } else {
    if (payments.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_payments.csv", convert.arrayToCsv(payments));
    }
  }
});

recurring = new freshbooks.Recurring();

recurring_lines = [];

recurring.list({}, function(err, recurrings) {
  if (err != null) {
    console.log("recurring list error");
    return console.log(err);
  } else {
    recurrings.each(function(recurring) {
      console.log("recurring id: " + recurring.recurring_id);
      return recurring.lines.each(function(line) {
        return recurring_lines.push(Object.merge({
          recurring_id: recurring.recurring_id
        }, line));
      });
    });
    if (recurrings.length > 0) {
      fs.writeFileSync(data_dir + "/" + datestamp + "_recurrings.csv", convert.arrayToCsv(recurrings, attributes.recurring));
    }
    if (recurring_lines.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_recurring_line_items.csv", convert.arrayToCsv(recurring_lines));
    }
  }
});

tax = new freshbooks.Tax();

tax.list({}, function(err, taxes) {
  if (err != null) {
    console.log("tax list error");
    return console.log(err);
  } else {
    if (taxes.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_taxes.csv", convert.arrayToCsv(taxes));
    }
  }
});

task = new freshbooks.Task();

task.list({}, function(err, tasks) {
  if (err != null) {
    console.log("task list error");
    return console.log(err);
  } else {
    console.log(JSON.stringify(tasks, null, "\t"));
    if (tasks.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_tasks.csv", convert.arrayToCsv(tasks));
    }
  }
});

time_entry = new freshbooks.Time_Entry();

time_entry.list({}, function(err, time_entries) {
  if (err != null) {
    console.log("time_entry list error");
    return console.log(err);
  } else {
    if (time_entries.length > 0) {
      return fs.writeFileSync(data_dir + "/" + datestamp + "_time_entries.csv", convert.arrayToCsv(time_entries));
    }
  }
});
