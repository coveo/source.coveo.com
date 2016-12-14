---
layout: post
title: My first Visual Studio Code extension (vsforce)
excerpt: Our experience creating our first Visual Studio Code extension, details about the vsforce extension, and information that would have been useful when starting its development.
tags:
  - Visual Studio Code
  - Extension
  - Salesforce
  - vsforce
  - TypeScript
  - JavaScript
author:
  name: André Thériault, Lucien Bénié & Étienne Rocheleau
  bio: Salesforce Integration developers, demo engineer
  imageURL: https://avatars.githubusercontent.com/erocheleau
published: true
---

## What is Visual Studio Code?
[Visual Studio Code](https://github.com/Microsoft/vscode) is a free open-source, cross-platform [TypeScript](https://www.typescriptlang.org/) based editor from the **Microsoft** team. It is built with [electron](https://github.com/electron/electron), a framework based on [Node.js](https://nodejs.org/en/) and [Chromium](http://www.chromium.org/) that lets you write cross-platform desktop applications using JavaScript, HTML, and CSS.

## TypeScript
TypeScript is a free and open-source programming language developed and maintained by **Microsoft**. It's a superset of JavaScript and adds static typing and classed based object-oriented programming to the language. It is included as a first-class programming language in Visual Studio Code.

As mentioned on the TypeScript website:
> TypeScript starts from the same syntax and semantics that millions of JavaScript developers know today. TypeScript compiles to clean, simple JavaScript code which runs on any browser, in Node.js, or in any JavaScript engine that supports ECMAScript 3 (or newer).

## Our first Visual Studio Code extension
We at Coveo have been using Visual Studio Code for a while and we liked its performance speed compared to [Atom](https://atom.io/). Both are built on electron but vscode is faster in every category, from a project wide search to opening a large project codebase.

## Why a Salesforce extension?
If you've been working with Salesforce, you know that the entire process of writing and publishing code can be tricky and slow at times. You may also know that the Salesforce developer console does not offer all the features of a full fledged IDE/editor. Having your codebase locally on your machine is essential when working with a version control software.

### The purpose of vsforce
We've created [vsforce](https://github.com/coveo/vsforce) in order to make the process much simpler and much quicker than it is right now for you to create, test, and publish your code from your local machine.

There are other extensions out there but none of them filled the feature list we wanted or worked the way we'd have liked.

**We also wanted to have the control over the extension to be able to update it following Salesforce possible changes in API or new development features**.

### Useful features
vsforce provides a lot of feature to help us developers be more efficient when writing Apex/Lightning code for Salesforce.

#### Auto-complete and syntax highlighting
One of the major feature that we wanted to have in the first release was the ability to propose auto-completion while coding. All the information on the components and their attributes are obtainable through the Salesforce [Metadata API](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_intro.htm). We wanted to accelerate our coding speed by having completion-as-you-type following known components without having to try a deploy to see if it would fail, for instance if you made a mistake while typing the name of a component or an Apex class; this could take several minutes, depending on how long and complex your deploy process is.

![Auto-complete](/images/2016-12-07-vsforce/auto-completion.gif "Auto-complete")

To that auto-complete feature, we also wanted to add syntax highlighting to limit the number of errors by giving visual cues to understand a page of code at first glance. Unfortunately, we still have issues with the grammar and syntax of the [Apex language](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_intro.htm). This language is very similar to Java, but with specific differences in the most used keywords and language structure. In order to build a language support extension for vscode, you have to supply a [TextMate grammar (.tmLanguage)](https://code.visualstudio.com/docs/extensions/language-support) file which essentially contains a bunch of regular expressions to tokenize your language. We included one for the two currently supported languages, `visualforce` and `apex`.

#### Retrieve and deploy packages or files

Another operation necessary to local development with Salesforce is the ability to deploy/retrieve packaged or single file(s). To do this, we respect the standard format of a Salesforce workspace with the different files separated by type in folders and a `package.xml` at the root. When calling a deploy/retrieve operation, you will be prompted to choose which `package.xml` to use if more than one was found in your current workspace. The extension then sends a deploy or a retrieve request to Salesforce and handles the response.

Once completed, the user can choose to view the output of the operation and eventual errors. Errors within a file are displayed in the **Problems** section of vscode with a link to the specific line when available. We are still working on the deploy single file operation.

![deploy](/images/2016-12-07-vsforce/deployPackageSmallwindow.gif "Deploy Package")

#### Diff from server, fetch logs and others...
Other features were also added to make it easier for us specifically to work with our current products, namely the ability to fetch the current version of a file from Salesforce and to use vscode built-in tool to view a diff with the local file.

![compare](/images/2016-12-07-vsforce/compare.gif "Compare with Salesforce")

This feature is meant to solve the fact that Salesforce does not offer a versioning mechanism on code files. This feature is very useful when more than one person is working on the same file or component. Eventually, we would be able to add a check before a single file deploy to validate that you would not overwrite a more recent version from Salesforce.

We have also found it useful to directly activate and fetch the logs from your Salesforce organization to be able to parse them locally. Salesforce normally requires you to manually activate the logs if you want to be able to view system information while executing server-side code. With this feature, we are able to activate the logs for your user and fetch them after the operation you are testing has completed.

We can also execute [SOQL](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql.htm) queries directly from the context menu locally by selecting a query and executing the command. Furthermore, we can open a text input by calling the command `vsforce: Execute SOQL` from the command palette. The results are presented in an easy to read format in the editor.

![SOQL](/images/2016-12-07-vsforce/soql-query.gif "SOQL query")

These were normally operations that required us to open Salesforce, and we felt they were slowing us down, hence why we created the extension.

# How it works (Coming in a future post!)

