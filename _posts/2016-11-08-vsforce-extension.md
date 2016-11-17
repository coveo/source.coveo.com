---
layout: post
title: My first Visual Studio Code extension (vsforce)
excerpt: Our experience in creating our first Visual Studio Code extension, details about the extension vsforce and what knowledge would have been useful before we started development.
tags:
  - Visual Studion Code
  - Extension
  - Salesforce
  - vsforce
author:
  name: Andre Theriault, Lucien Benie, Etienne Rocheleau
  bio: Salesforce Integration developpers, demo engineer
  image: 
published: true
---

[Introduction]

## My first Visual Studio Code extension
[Generic information about a vscode extension]

## The purpose of vsforce

### Why a salesforce extension
If you've been working with Salesforce, you know that the entire process of making and publishing code can be tricky and slow sometime. And also if you have tried to use the Salesforce developer console you know it does not offer you all the features you would like and having your development code locally on your machine is essential to work with a version control software. 

We've created [vsforce] in order to make the process much simpler and much quicker than it is right now for you to create, test and publish your code from your local machine. There are other extensions out there but none of them filled the feature list we wanted or worked the way we'd have liked. We also wanted to have the control over the extension to be able to update it following salesforce possible changes in API or new development features.

### Useful features

#### Auto-complete and syntax highlighting
One of the major feature that we wanted to have in the first release of this extension was the ability to propose auto-completion while coding. All the information about which components exist in your organization and what attributes they have are obtainable through the salesforce [Metadata API](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_intro.htm). We wanted to speed up our coding speed by having completions as you type following known components without having to try a deploy to see if it would fail because you made a mistake while typing the name of a component or an apex class (sometimes after several minutes depending how long and complex your deploy process is).

To that auto-complete feature we also wanted to add syntax highlighting to also limit the number of errors by giving visual cues but also to help have a better understanding of a page of code at a glance. Unforntunately we still have issues with the grammar and syntax of the [Apex language](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_intro.htm). This language is very similar to Java but with significant specific differences in the most used keywords and language structure. In order to build a language support extension for Vscode, you have to supply a [TextMate grammar (.tmLanguage)](https://code.visualstudio.com/docs/extensions/language-support) file which contains basically a bunch of regular expressions to tokenize your language. We included one for each of the supported languages, for now `visualforce` and `apex`.

#### Retrieve and deploy packages or files
Another of the essential features on our list was to be able to maintain a link to your salesforce organization and be able to deploy or retrieve packaged files or single files. The operation of deploying a package require a strict file structure and a specific manifest file called `package.xml` to describe the content to deploy or to retrieve, if you have worked with local code that you deploy afterwards onto your salesforce organization you should be familiar with the process. These operations can be repeated very frequently since there is no reliable way to really test your code locally on your machine, you have to deploy it to the cloud to test. So these features of the extension had to be very simple because they would be repeated frequently.

For now, whenever you invoke the deploy or retrieve package command in Vscode, the extension will search in your current workspace for a `package.xml` file to use. If it finds multiple, it will ask you to choose which one you want to use for this operation. The rest of the operation will assume your `package.xml` is at the root of the folder you want packaged and deployed for example. We chose to function this way because it was the structure enforced by salesforce to do those kind of operations with their provided tool. So the extension will zip the folder and send it to salesforce, or send a request describing which files you want to retrieve and handle the received zip.

Once any of those two tasks are completed, you will have the choice to view the output of the operation which is the response salesforce sent. It will include possible errors along with a description of the error if Salesforce replied with one. We also used the Problems section in the bottom status bar of Vscode to display errors within a file with the line number and column if they were returned by Salesforce following a deploy operation.

#### Execute SOQL query, fetch logs and others...
[TODO]
 
### How it works

- [salesforce API]
    - [Metadata API]
    - [Tooling API]
- [jsforce]

## What we would've liked to know before

### Visual Studio Code extension development gotchas

### Patterns we used

- [How to communicate information to the user]
    - [Loading bar]
    - [User info bar at the top]
    - [Output window]

### Useful tricks
