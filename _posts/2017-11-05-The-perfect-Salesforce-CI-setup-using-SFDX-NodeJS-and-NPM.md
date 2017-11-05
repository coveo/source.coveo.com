---
layout: post

title: The perfect Salesforce CI setup using SFDX, NodeJS and NPM
tags: "salesforce sfdx npm nodejs sfdx-js sfdx-prebuilt gulp"

author:
  name: Marc-Antoine Veilleux
  bio: Coveo for Salesforce Team Lead
  image: maveilleux.jpg
---


I’ve been working on the Salesforce platform at Coveo for about 3 years. In those 3 years, I always had the feeling that there was something missing in our continuous integration setup. A couple of years ago, we’ve automated the process of creating a managed package using PhantomJS. As an ISV, this is a well-deserved upgrade. Since then, we were able to gain a lot of speed in our release process. But still, there was something missing. There was a void in my developer life. Demoing, reviewing and testing new features on our package was near impossible and needed a lot of effort. Since Salesforce organization can’t be created easily, a developer had to create a new org, push all the code to that org from his machine, give credentials to everyone, etc... A lot of _works on my machine(TM)_ and _Jenkins is weird_ occurred from those.

<!-- more -->

## Salesforce DX
We had no solutions, but, last year, Salesforce introduced Salesforce DX at Dreamforce and the wait is finally over – Salesforce DX is now GA and it’s free. From a high-level perspective, SFDX is a set of tools exposed through a CLI meant for Salesforce developers. It eases a lot of task with data manipulation, source code management and org management. The main feature we need here is org management. Using SFDX CLI, we are now able to create scratches organizations from a simple command line. 

## How to
To do so, you need 3 simple things. A way to authenticate to your Dev Hub, a scratch organization definition file and the SFDX CLI. Here’s an example:

```
sfdx force:auth:web:login -s
sfdx force:org:create -f config/scratch-def.json
```

And here's the `scratch-def.json`

```json
{
  "orgName": "CoveoScratchOrg",
  "country": "US",
  "edition": "Enterprise",
  "features": "MultiCurrency;AuthorApex;Communities",
  "orgPreferences": {
    "enabled": ["NetworksEnabled", "ChatterEnabled"]
  }
}
```

And now, using the `force:source` or `force:mdapi` commands, you can easily push code to the newly created org. 

### Installation
Now that we know all those things, how can we integrate all of this inside our continuous integration system? Let’s start by making sure SFDX is correctly installed on each machine and let’s make sure it also works on the developer machines as is. There are multiple options here, docker images, manual steps and even wishful thinking. After some research, I’ve found out that Salesforce host a manifest file containing URL to download, SHA signatures for each different OS. So, the next step is figuring out, how to make it work. On previous projects, I’ve used the phantomjs-prebuilt open source project to install successfully phantomjs. I really liked the idea that, whether the context (developer, windows, OS X, linux, Jenkins, Travis), it will install the needed binary correctly in the “install” phase of NPM. That’s the reason I’ve created sfdx-prebuilt. It’s an open source project that will install, if needed, SFDX and return the right path to the it. To do so, use npm like so:

```
npm install sfdx-prebuilt
```

### Usage
Now that we have installed SFDX, let’s use it. Because I want to parse complex responses to commands and actually code some feature around SFDX, I didn’t think using the CLI like command lines without any kind of proper around it was the right way. Yet again, I’ve created the project sfdx-js. It’s an open source project that wraps the SFDX CLI. It wraps each functions and attributes one-to-one. The best part, it’s totally auto-generated from the SFDX CLI documentation in typescript. It means that it has all the nice type-doc with type checking, mandatory arguments checking and autocomplete. You should really try it out, even if it’s only for the auto-complete part. Here’s an example on how to use it:

```javascript
const sfdx = require('sfdx-js').Client.createUsingPath('sfdx')
sfdx.auth.webLogin().then(function() {
  console.log('done!');
})
```

### CLI Authentication
We now have a good solution to run SFDX commands easily on any machine, now, let’s authenticate. There are two ways you can authenticate to the SFDX cli using only the command line: the sfdx:URL or the jwt:grant command. Both works in most cases, but the JWT is the far better option. In fact, to the naked eye, both authentication seems equivalent but they are not! When you create a scratch org using the sfdxurl, you are not able to re-authenticate the scratch org later on, but by using the JWT token, you can easily and painlessly do it. So, right now, take my word for it, use the JWT flow. There is a [good documentation to help you create all the needed certificate](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_jwt_flow.htm). When you have the certificate, I’ve personally decided to use environment variable to pass them along. CI can easily inject environment variable and developers can set them easily or use something like [dotenv](https://github.com/motdotla/dotenv).

### Reuse Scratch Orgs
What’s next? Well, right now we must tackle the problem of cleaning up unused scratch org. There are some limit in Salesforce that forces you to be intelligent about how many active scratch org you have. I’ve decided to go with the logic that we only need 1 scratch org per SCM branch. The next problem is that, if you create any scratch org using the CI, the CI doesn’t remember everything between each build. I’ve tried multiple things, but at the end of the day, I’ve decided to use the field called “AlmReference” on the “ActiveScratchOrg” object in Dev Hub. Basically, Salesforce have a default field exactly for the purpose of adding information from your build systems. I’ve decided to feed the field with a custom JSON file with the current branch name. Since scratch org are simply a record in the dev org, you can delete them easily using standard record manipulation API. Problem solved, now we create only 1 org per branch and you can easily push to code using the sfdx-js project.

### Demoing
We are almost over, there is only one last issue: we cannot demo it easily. People still need to have a lot of knowledge about how SFDX works to open a scratch org (Auth to SFDX, find the right org username, auth to the scratch org, open the scratch org, etc…). I’ve decided to create a gulp helper to encapsulate the complexity. Now, users have to “npm install” the project and write, “gulp openScratchOrg –alias <branchName>”. It’s still a bit technical, but one thing I could do is create a web service that to all the hard part and returns the login URL prefilled with the session id. Since this solution also need to have a way to authenticate user and make sure they are able to “open scratch org”, I’ve decided to wrap it up there and maybe do it in a future project.

## Conclusion and scripts
So that’s it folks! Here’s, in my opinion, the best way to set up a Salesforce project today. I’ve shared the complete scripts here (GITHUB LINK TO THE SCRIPTS). Feel free to comment and create a pull request.

Cheers!