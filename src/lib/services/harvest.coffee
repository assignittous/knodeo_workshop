# harvest.coffee

'use strict'
CSON = require('cson')
logger = require('../../lib/logger').Logger

convert = require('../../lib/convert').Convert
fs = require('fs')
Harvest = require('harvest')


cwd = process.env.PWD || process.cwd()
configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
data_dir = "#{cwd}/#{configuration.cloud.harvest.data_path}"

# Harvest API docs here: https://github.com/harvesthq/api/tree/master/Sections

# Time and Expense Reporting are used to get --all-- entries by project

# Rate limits: 100 requests per 15s
#  todo: throttle the requests to ensure that < 100 are done per 15s


day = Date.create()

datestamp = day.format('{yyyy}-{MM}-{dd}')
# start with clients  
harvest = new Harvest(
  subdomain: configuration.cloud.harvest.subdomain
  email: configuration.cloud.harvest.email
  password: configuration.cloud.harvest.password)


clients = harvest.Clients

clients.list {}, (err, clients)->
  if err
    console.log "CLIENTS ERROR"
  else
    fixed_clients = []
    clients.each (object)->
      fixed_clients.push object.client

    if fixed_clients.length > 0
      console.log JSON.stringify(fixed_clients,null," ")
      fs.writeFileSync("#{data_dir}/#{datestamp}_clients.csv", convert.arrayToCsv(fixed_clients))     

harvest.Projects.list {}, (err,projects)->
  if (err)
    console.log "ERROR"
  else
    
    fixed_projects = []
    projects.each (object)->
      fixed_projects.push object.project      
    if fixed_projects.length > 0
      console.log JSON.stringify(fixed_projects,null," ")
      fs.writeFileSync("#{data_dir}/#{datestamp}_projects.csv", convert.arrayToCsv(fixed_projects))     

harvest.Tasks.list {}, (err,tasks)->
  if (err)
    console.log "ERROR"
  else
    
    fixed_tasks = []
    tasks.each (object)->
      fixed_tasks.push object.task  
    if fixed_tasks.length > 0
      console.log JSON.stringify(fixed_tasks,null," ")
      fs.writeFileSync("#{data_dir}/#{datestamp}_tasks.csv", convert.arrayToCsv(fixed_tasks))     
   
harvest.ClientContacts.list {}, (err, contacts)->
  if (err)
    console.log "ERROR"
  else
    
    fixed_contacts = []
    contacts.each (object)->
      fixed_contacts.push object.contact  
    if fixed_contacts.length > 0
      console.log JSON.stringify(fixed_contacts,null," ")
      fs.writeFileSync("#{data_dir}/#{datestamp}_client_contacts.csv", convert.arrayToCsv(fixed_contacts))     




harvest.ExpenseCategories.list {}, (err, expense_categories)->
  if (err)
    console.log "ERROR"
  else
    
    fixed_expense_categories = []
    expense_categories.each (object)->
      fixed_expense_categories.push object.expense_category  
    if fixed_expense_categories.length > 0
      console.log JSON.stringify(fixed_expense_categories,null," ")
      fs.writeFileSync("#{data_dir}/#{datestamp}_expense_categories.csv", convert.arrayToCsv(fixed_expense_categories))     






harvest.InvoiceCategories.list {}, (err, invoice_categories)->
  if (err)
    console.log "ERROR"
  else
    
    fixed_invoice_categories = []
    invoice_categories.each (object)->
      fixed_invoice_categories.push object.invoice_category  
    if fixed_invoice_categories.length > 0
      console.log JSON.stringify(fixed_invoice_categories,null," ")
      fs.writeFileSync("#{data_dir}/#{datestamp}_invoice_categories.csv", convert.arrayToCsv(fixed_invoice_categories))     






harvest.People.list {}, (err, people)->
  if (err)
    console.log "ERROR"
  else
    
    fixed_people = []

    people.each (object)->
      fixed_people.push object.user  
    if fixed_people.length > 0
      console.log JSON.stringify(fixed_people,null," ")
      fs.writeFileSync("#{data_dir}/#{datestamp}_people.csv", convert.arrayToCsv(fixed_people))     


harvest.Invoices.list {}, (err, invoices)->
  if (err)
    console.log "ERROR"
  else
    
    fixed_invoices = []
    fixed_invoice_messages = []
    fixed_invoice_payments = []

    console.log JSON.stringify(invoices,null," ")
    invoices.each (object)->
      fixed_invoices.push object.invoices

      # handle children -- gotcha - api is synchronous
      ###
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

      ###

    console.log "fixed_invoice_payments"
    console.log JSON.stringify(fixed_invoice_payments,null," ")
    if fixed_invoice_payments.length > 0

      fs.writeFileSync("#{data_dir}/#{datestamp}_invoice_payments.csv", convert.arrayToCsv(fixed_invoice_payments))    

    console.log "fixed_invoice_messages"
    console.log JSON.stringify(fixed_invoice_messages,null," ")
    if fixed_invoice_messages.length > 0

      fs.writeFileSync("#{data_dir}/#{datestamp}_invoice_messages.csv", convert.arrayToCsv(fixed_invoice_messages))    



    if fixed_invoices.length > 0
      console.log JSON.stringify(fixed_invoices,null," ")
      fs.writeFileSync("#{data_dir}/#{datestamp}_invoices.csv", convert.arrayToCsv(fixed_invoices))     







TimeTracking = harvest.TimeTracking  
###

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


###

