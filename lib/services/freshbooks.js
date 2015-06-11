'use strict';
var FreshBooks, attributes, category, cleanedArrayAttribute, client, config, data_dir, datestamp, day, estimate, estimate_lines, expense, freshbooks, invoice, invoice_lines, item, language, logger, output, payment, project, recurring, recurring_lines, request, serviceConfig, staff, task, tax, thisService, time_entry;

require('sugar');

config = require("../../lib/configuration").Configuration;

logger = require('../../lib/logger').Logger;

output = require('../../lib/data').Data;

request = require("../../lib/http").Http;

thisService = "freshbooks";

serviceConfig = config.forService(thisService);

data_dir = config.dataDirectoryForService(thisService);

FreshBooks = require("freshbooks");

freshbooks = new FreshBooks(serviceConfig.api_url, serviceConfig.api_token);

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
  if (err != null) {
    console.log("invoice list error");
    return console.log(err);
  } else {
    return output.toCsv(data_dir + "/" + datestamp + "_clients.csv", clients, attributes.client);
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
      output.toCsv(data_dir + "/" + datestamp + "_projects.csv", projects, attributes.project);
    }
    if (resources.length > 0) {
      output.toCsv(data_dir + "/" + datestamp + "_resources.csv", resources);
    }
    if (tasks.length > 0) {
      return output.toCsv(data_dir + "/" + datestamp + "_tasks.csv", tasks);
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
      return output.toCsv(data_dir + "/" + datestamp + "_expense_categories.csv", categories);
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
    if (estimates.length > 0) {
      output.toCsv(data_dir + "/" + datestamp + "_estimates.csv", estimates, attributes.estimate);
    }
    if (estimate_lines.length > 0) {
      return output.toCsv(data_dir + "/" + datestamp + "_estimate_line_items.csv", estimate_lines);
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
      return output.toCsv(data_dir + "/" + datestamp + "_expenses.csv", expenses);
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
      output.toCsv(data_dir + "/" + datestamp + "_invoices.csv", invoices, attributes.invoice);
    }
    if (invoice_lines.length > 0) {
      return output.toCsv(data_dir + "/" + datestamp + "_invoice_line_items.csv", invoice_lines);
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
      return output.toCsv(data_dir + "/" + datestamp + "_items.csv", items);
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
      return output.toCsv(data_dir + "/" + datestamp + "_languages.csv", languages);
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
      return output.toCsv(data_dir + "/" + datestamp + "_staff.csv", people, attributes.staff);
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
      return output.toCsv(data_dir + "/" + datestamp + "_payments.csv", payments);
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
      output.toCsv(data_dir + "/" + datestamp + "_recurrings.csv", recurrings, attributes.recurring);
    }
    if (recurring_lines.length > 0) {
      return output.toCsv(data_dir + "/" + datestamp + "_recurring_line_items.csv", recurring_lines);
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
      return output.toCsv(data_dir + "/" + datestamp + "_taxes.csv", taxes);
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
      return output.toCsv(data_dir + "/" + datestamp + "_tasks.csv", tasks);
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
      return output.toCsv(data_dir + "/" + datestamp + "_time_entries.csv", time_entries);
    }
  }
});
