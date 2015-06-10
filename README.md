# Knodeo Workshop

Database and data management command-line tools for Knodeo, a suite of business intelligence products made by (Assign It To Us)[http://assignittous.com].

##tldr##

Knodeo Workshop is a wrapper for Liquibase and Scriptella, two free, open-source software packages. It also does some additional tasks such as 
pulling data from popular cloud services. 

## What do Knodeo Workshop's Tools Do?

* Manage database models using Liquibase
* Run ELT scripts using Scriptella
* Pull data from cloud services into a data warehouse ready format

All of the above use a `git` style command line structure.

## Should I use this in my project?

Knodeo Workshop was designed for use specifically with the Knodeo suite of products, but because it's a standalone CLI, you can choose to use it 
for your own, non-Knodeo related projects. The tasks it does are relatively straightforward. The key is to read the documentation and determine 
whether the way the Workshop works is compatible with your development workflow.

## But Why?

Knodeo Workshop is a tool set that has an opinionated design, with some choices that might confound at first, but there is method to the 
madness.

The Knodeo suite of products is designed to use common domain-specific languages and file types: JADE & CSON being the ones that directly 
apply to the Knodeo Workshop. This allows Knodeo developers to avoid "mode switching" by having to muddle with XML files.

## Installation

`npm install knodeo_workshop -g`

## Prerequisites

* Liquibase
* Scriptella

Both installed and in the system path, including their dependencies (Java). 

If you can successfully use `liquibase` and `scriptella` commands in your terminal/shell, 
you should be good to go.

## Detailed Documentation

Visit this repo's wiki. https://github.com/assignittous/knodeo_workshop/wiki
