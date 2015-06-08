# # elt-mailchimp

# Get campaign data from  mailchimp

'use strict'

logger = require('../../lib/logger').Logger
output = require('../../lib/data').Data


CSON = require('cson')
cwd = process.env.PWD || process.cwd()

config = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
request = require("../../lib/http").Http


require('sugar')

day = Date.create()

datestamp = day.format('{yyyy}-{MM}-{dd}')



mailchimpConfig = config.cloud.mailchimp

token = mailchimpConfig.token

dataCenter = token.split('-')[1]

baseUrl = "https://#{dataCenter}.api.mailchimp.com/3.0"

attributes =
  campaigns: [
   "id"
   "type"
   "create_time"
   "archive_url"
   "status"
   "emails_sent"
   "send_time"
   "content_type"
  ]
  recipients: [
    "list_id"
  ]
  settings: [
    "subject_line"
    "title"
    "from_name"
    "reply_to"
    "use_conversation"
    "to_name"
    "folder_id"
    "authenticate"
    "auto_footer"
    "inline_css"
    "auto_tweet"
    "fb_comments"
    "timewarp"
    "template_id"
    "drag_and_drop"
  ]
  tracking: [
    "opens"
    "html_clicks"
    "text_clicks"
    "goal_tracking"
    "ecomm360"
    "google_analytics"
    "clicktale"
  ]
  report_summary: [
    "opens"
    "unique_opens"
    "open_rate"
    "clicks"
    "subscriber_clicks"
    "click_rate"
  ]



headers =
  "User-Agent": "Data Warehouse ELT"
  "Authorization" : "Basic #{new Buffer("etl:#{mailchimpConfig.token}").toString('base64')}"



data = request.getObject "#{baseUrl}/campaigns", { headers: headers }

# note teh data center in the url corresponds to suffix in apikey

dataDir = "#{cwd}/#{mailchimpConfig.data_path}"

if data.campaigns.length > 0
  
  output.toCsv "#{dataDir}/#{datestamp}_campaigns.csv", data.campaigns, attributes.campaigns




recipients = []
settings = []
tracking = []
report_summary = []

data.campaigns.each (campaign)->
  recipients.push Object.merge({ campaign_id: campaign.id }, Object.select(campaign.recipients,attributes.recipients))    
  settings.push Object.merge({ campaign_id: campaign.id }, Object.select(campaign.settings,attributes.settings))    
  tracking.push Object.merge({ campaign_id: campaign.id }, Object.select(campaign.tracking,attributes.tracking))    
  report_summary.push Object.merge({ campaign_id: campaign.id }, Object.select(campaign.report_summary,attributes.report_summary))            


if recipients.length > 0
  output.toCsv "#{dataDir}/#{datestamp}_recipients.csv", recipients
if settings.length > 0
  output.toCsv "#{dataDir}/#{datestamp}_settings.csv", settings 
if tracking.length > 0
  output.toCsv "#{dataDir}/#{datestamp}_tracking.csv", tracking 
if report_summary.length > 0
  output.toCsv "#{dataDir}/#{datestamp}_report_summary.csv", report_summary
