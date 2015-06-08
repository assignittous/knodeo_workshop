# freshbooks.coffee

'use strict'

logger = require('../../lib/logger').Logger
output = require('../../lib/data').Data

FreshBooks = require("freshbooks")
CSON = require('cson')


cwd = process.env.PWD || process.cwd()
configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
data_dir = "#{cwd}/#{configuration.cloud.freshbooks.data_path}"

# Note: Freshbooks doesn't work with Node 0.12 because of the versoin of libxml2 required by the npm
# http://www.freshbooks.com/developers/authentication

freshbooks = new FreshBooks configuration.cloud.freshbooks.api_url, configuration.cloud.freshbooks.api_token


# Some freshbooks attributes are line feed separated values
# use this fn to clean

cleanedArrayAttribute = (stringArray)->
  if stringArray.length > 0
    values = stringArray.split('\n').map (object)->
      return object.trim()
    values.remove('')
    return values
  else
    return []




attributes =
  client: [
    "client_id"
    "first_name"
    "email"
    "username"
    "home_phone"
    "mobile"
    "organization"
    "work_phone"
    "fax"
    "vat_name"
    "vat_number"
    "p_street1"
    "p_street2"
    "p_city"
    "p_state"
    "p_country"
    "p_code"
    "s_street1"
    "s_street2"
    "s_city"
    "s_state"
    "s_country"
    "s_code"
    "notes"
    "language"
    "currency_code"
    "folder"
    "updated"
    "credit"
  ]
  project: [
    "project_id"
    "name"
    "description"
    "rate"
    "bill_method"
    "client_id"
    "project_manager_id"
    "external"
    "budget"
  ]
  estimate: [
    "estimate_id"
    "number"
    "staff_id"
    "client_id"
    "contact_id"
    "organization"
    "first_name"
    "last_name"
    "p_street1"
    "p_street2"
    "p_city"
    "p_state"
    "p_country"
    "p_code"
    "po_number"
    "status"
    "amount"
    "date"
    "notes"
    "terms"
    "discount"
    "language"
    "currency_code"
    "vat_name"
    "vat_number"
    "folder"
  ]
  invoice: [
    "invoice_id"
    "number"
    "client_id"
    "contact_id"
    "recurring_id"
    "organization"
    "first_name"
    "last_name"
    "p_street1"
    "p_street2"
    "p_city"
    "p_state"
    "p_country"
    "p_code"
    "po_number"
    "status"
    "amount"
    "amount_outstanding"
    "paid"
    "date"
    "notes"
    "terms"
    "discount"
    "return_uri"
    "updated"
    "currency_code"
    "language"
    "vat_name"
    "vat_number"
    "folder"
    "staff_id"
  ]
  recurring: [
    "recurring_id"
    "number"
    "client_id"
    "contact_id"
    "recurring_id"
    "organization"
    "first_name"
    "last_name"
    "p_street1"
    "p_street2"
    "p_city"
    "p_state"
    "p_country"
    "p_code"
    "po_number"
    "status"
    "amount"
    "amount_outstanding"
    "paid"
    "date"
    "notes"
    "terms"
    "discount"
    "return_uri"
    "updated"
    "currency_code"
    "language"
    "vat_name"
    "vat_number"
    "folder"
    "staff_id"
  ]    
  staff: [
    "username"
    "first_name"
    "last_name"
    "email"
    "business_phone"
    "mobile_phone"
    "home_phone"
    "fax"
    "rate"
    "last_login"
    "number_of_logins"
    "signup_date"
    "street1"
    "street2"
    "city"
    "state"
    "country"
    "code"
    "notes"
    "staff_id"
  ]
day = Date.create()

datestamp = day.format('{yyyy}-{MM}-{dd}')
# start with clients


client = new freshbooks.Client()
client.list  {}, (err, clients)->
  if err?
    console.log "invoice list error"
    console.log err
  else
    output.toCsv "#{data_dir}/#{datestamp}_clients.csv", clients, attributes.client

project = new freshbooks.Project()
project.list {}, (err, projects)->
  if err?
    console.log "project list error"
    console.log err
  else

    
    resources = []
    tasks = []

    projects.each (project)->
      project.budget = project.budget.trim()
      project.contractors = cleanedArrayAttribute(project.contractors)
      project.staff = cleanedArrayAttribute(project.staff)

      if project.contractors.length > 0
        project.contractors.each (contractor)->
          resources.push
            project_id: project.project_id
            staff_id: null
            contractor_id: contractor

      if project.staff.length > 0
        project.staff.each (staff)->
          resources.push
            project_id: project.project_id
            staff_id: staff
            contractor_id: null

      if project.tasks.length > 0
        project.tasks.each (task)->
          tasks.push
            project_id: project.project_id
            task_id: task.task_id
            rate: task.rate


    

    if projects.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_projects.csv", projects, attributes.project
    if resources.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_resources.csv", resources


    if tasks.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_tasks.csv", tasks


# expense categories
category = new freshbooks.Category()


category.list {}, (err, categories)->
  if err?
    console.log "category list error"
    console.log err
  else
    if categories.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_expense_categories.csv", categories

# estimates






estimate = new freshbooks.Estimate()


estimate_lines = []


estimate.list {}, (err, estimates)->
  if err?
    console.log "estimate list error"
    console.log err
  else
    #console.log JSON.stringify(estimates,null,'\t')
    estimates.each (estimate)->
      console.log "estimate id: #{estimate.estimate_id}"
      estimate.lines.each (line)->
        estimate_lines.push Object.merge( {estimate_id: estimate.estimate_id }, line)


    if estimates.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_estimates.csv", estimates, attributes.estimate    
    if estimate_lines.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_estimate_line_items.csv", estimate_lines


expense = new freshbooks.Expense()


expense.list {}, (err, expenses)->
  if err?
    console.log "expense list error"
    console.log err
  else
    if expenses.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_expenses.csv", expenses



invoice = new freshbooks.Invoice()


invoice_lines = []


invoice.list {}, (err, invoices)->
  if err?
    console.log "invoice list error"
    console.log err
  else
    #console.log JSON.stringify(invoices,null,"\t")
    invoices.each (invoice)->
      console.log "invoice id: #{invoice.invoice_id}"
      invoice.lines.each (line)->
        invoice_lines.push Object.merge( {invoice_id: invoice.invoice_id }, line)

    if invoices.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_invoices.csv", invoices, attributes.invoice

    if invoice_lines.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_invoice_line_items.csv", invoice_lines






item = new freshbooks.Item()


item.list {}, (err, items)->
  if err?
    console.log "item list error"
    console.log err
  else
    if items.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_items.csv", items


language = new freshbooks.Language()


language.list {}, (err, languages)->
  if err?
    console.log "language list error"
    console.log err
  else
    if languages.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_languages.csv", languages


staff = new freshbooks.Staff()


staff.list {}, (err, people)->
  if err?
    console.log "staff list error"
    console.log err
  else
    #people.each (person)->
    #  person.staff = cleanedArrayAttribute(project.staff)
    #console.log JSON.stringify(people,null,"\t")
    if people.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_staff.csv", people, attributes.staff




payment = new freshbooks.Payment()


payment.list {}, (err, payments)->
  if err?
    console.log "payment list error"
    console.log err
  else
    if payments.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_payments.csv", payments






recurring = new freshbooks.Recurring()


recurring_lines = []


recurring.list {}, (err, recurrings)->
  if err?
    console.log "recurring list error"
    console.log err
  else
    #console.log JSON.stringify(recurrings,null,"\t")
    recurrings.each (recurring)->
      console.log "recurring id: #{recurring.recurring_id}"
      recurring.lines.each (line)->
        recurring_lines.push Object.merge( {recurring_id: recurring.recurring_id }, line)

    if recurrings.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_recurrings.csv", recurrings, attributes.recurring
    if recurring_lines.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_recurring_line_items.csv", recurring_lines








tax = new freshbooks.Tax()


tax.list {}, (err, taxes)->
  if err?
    console.log "tax list error"
    console.log err
  else
    if taxes.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_taxes.csv", taxes


## billable tasks

task = new freshbooks.Task()


task.list {}, (err, tasks)->
  if err?
    console.log "task list error"
    console.log err
  else
    console.log JSON.stringify(tasks,null,"\t")
    if tasks.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_tasks.csv", tasks


time_entry = new freshbooks.Time_Entry()


time_entry.list {}, (err, time_entries)->
  if err?
    console.log "time_entry list error"
    console.log err
  else
    if time_entries.length > 0
      output.toCsv "#{data_dir}/#{datestamp}_time_entries.csv", time_entries


