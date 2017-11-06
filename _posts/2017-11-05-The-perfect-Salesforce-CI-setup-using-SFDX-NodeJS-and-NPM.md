---
layout: post

title: The perfect Salesforce CI setup using SFDX, NodeJS and NPM
tags: "salesforce sfdx npm nodejs sfdx-js sfdx-prebuilt gulp"

author:
  name: Marc-Antoine Veilleux
  bio: Coveo for Salesforce Team Lead
  image: maveilleux.jpg
---


I’ve been working on the Salesforce platform at Coveo for about 3 years. In those 3 years, I always had the feeling that there was something missing in our continuous integration setup. A couple of years ago, we’ve automated the process of creating a managed package using PhantomJS. As an ISV, this is a well-deserved upgrade. Since then, we were able to gain a lot of speed in our release process. But still, there was something missing. There was a void in my developer life. Demoing, reviewing and testing new features on our package was near impossible and needed a lot of effort. Since Salesforce organization can’t be created easily, a developer had to create a new org, push all the code to that org from his machine, give credentials to everyone, etc... A lot of _works on my machine(TM)_ and _Jenkins is weird_ hapenned using that method.

<!-- more -->

## Salesforce DX
At last year Dreamforce, Salesforce introduced Salesforce DX and since Winter '18, the wait is over. Salesforce DX is now GA and as a bonus, it’s free. From a high-level perspective, SFDX is a set of tools exposed through a CLI meant for Salesforce developers (DX = Developer Experience). It eases a lot of task with data manipulation, package management, source code management and org management. The key feature is really the last one: org management. Using SFDX CLI, we are now able to create scratches organizations from a simple command line. 

## How to
To do so, you need 3 simple things. A way to authenticate to your Dev Hub, a scratch org definition and the SFDX CLI. Here’s an example:

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

From there, you can start using the `force:source` or `force:mdapi` commands and easily push code to the newly created scratch org.

### Installation
Now that we know all those things, how can we integrate all of this inside our continuous integration system? Let’s start by making sure SFDX is correctly installed on each machine and that it also works on the developer machines. There are multiple options here, docker images, manual steps and even wishful thinking. After some research, I’ve found out that Salesforce host a manifest file that contains all the needed URL to download SFDX for each different OS. 

Then, using our source of truth, the next step is figuring out, how to make it work for everyone. On previous projects, I’ve used the phantomjs-prebuilt open source project to successfully install PhantomJs. I really liked the idea that, whatever the context (developer, windows, OS X, linux, Jenkins, Travis), it will install the needed binary correctly in the _install_ phase of NPM. That’s the reason I’ve created sfdx-prebuilt. It’s an open source project that will install, if needed, SFDX and return the right path to it. To use it, run a simple npm command:

```
npm install sfdx-prebuilt
```

### Usage
Now that we have installed SFDX, let’s use it. Because I want to parse complex responses from SFDX commands and actually code some feature around SFDX, I didn’t think using the CLI through child process was the right way. To solve that, I’ve created the sfdx-js project. It’s an open source project that wraps the SFDX CLI and each of its functions and attributes, one-to-one. The best part, it’s totally auto-generated from the SFDX CLI documentation in typescript. It means that it has all the nice type-doc advantages with type checking, mandatory arguments checking and autocomplete. You should really try it out, even if it’s only for the auto-complete part. Here’s an example how to use it:

```javascript
const sfdx = require('sfdx-js').Client.createUsingPath('sfdx')
sfdx.auth.webLogin().then(function() {
  console.log('done!');
})
```

### CLI Authentication
Having a good solution to run SFDX commands easily, the next problem is how to authenticate. There are two ways you can authenticate to the SFDX CLI using only the command line: the `force:auth:sfdxurl:store` and the `force:auth:jwt:grant` commands. To the naked eye, both authentication seems equivalent but, don't get fooled, they are not. When you create a scratch org using the `force:auth:sfdxurl:store` command, you will not be able to re-authenticate the scratch org later on. By using the JWT token, you can easily and painlessly re-authenticate by simply using the scratch org username and the JWT token. So, right now, take my word for it, use the JWT flow. There is a [good documentation to help you create all the needed certificate](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_jwt_flow.htm). When you have the certificate, I’ve personally decided to use environment variable to pass them along to the code. CI can easily inject environment variable and developers can set them easily on their machihe or use something like [dotenv](https://github.com/motdotla/dotenv).

### Reuse Scratch Orgs
One problem is still present, the fact that we must cleaning up unused scratch org. There are some limit in Salesforce that forces you to be intelligent about how many active scratch orgs you have. I’ve decided to go with 1 scratch org per SCM branch. The next problem is that, if you create any scratch org using the CI, the CI doesn’t remember everything between each build. I’ve tried multiple things, but at the end of the day, I’ve decided to use the field called “AlmReference” on the “ActiveScratchOrg” object in Dev Hub. Basically, Salesforce have a default field exactly for the purpose of adding information by your build systems. I’ve decided to feed the field with a custom JSON file with the current branch name. Since scratch org are simply a record in the dev org, you can delete them easily using standard record manipulation API. Problem solved, we can create only 1 org per branch and you can easily push to code using the sfdx-js project.

### Demoing
We are almost over, there is only one last issue: we cannot demo it easily. People still need to have a lot of knowledge about how to open a scratch org (Auth to SFDX, find the right org username, auth to the scratch org, open the scratch org, etc…). I’ve decided to create a gulp helper to encapsulate the complexity. Now, users simply have to “npm install” the project and write, `gulp openScratchOrg –-alias <branchName>`. It’s still a bit technical, but for me it's good enough. One thing I could do is create a web service that do all the hard part and returns the login URL prefilled with the session id for a specific branche name. Since this solution also need to have a way to authenticate user and make sure they are able to “open scratch org”, I’ve decided to wrap it up there and maybe do it in a future project.

## Conclusion and scripts
So that’s it folks! Here’s, in my opinion, the best way to set up a Salesforce project today. I’ve shared [all the scripts I've used on github](https://github.com/coveo/sfdx-js/blob/master/examples/setupScratchOrg.js) Feel free to comment and create a pull request.

Cheers!