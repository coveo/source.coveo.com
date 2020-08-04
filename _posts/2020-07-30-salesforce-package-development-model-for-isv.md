---
layout: post

title: "How to develop and structure a Salesforce Package in 2020"

tags: [salesforce, technologies, developer, isv]

author:
  name: Louis Bompart
  bio: Software Developer
  twitter: louisbompart
  image: lbompart.jpg
---

In October 2017, Salesforce released Salesforce DX, bringing source-driven development and scratch orgs to the Salesforce developer community, a considerable boon for every Salesforce developer. However, the code that ended in the hand of the user, was still not the source code but still the one that lies in a Salesforce organization, unfit for team collaboration.

2 years later, October 2019, Second-Generation Managed Package became GA, bringing the goodness of source-driven development to the packaging, unifying the code in a single place: your repository.

Such shifts in the development process might seem daunting at first, but let me show you how you could organize your code with those tools, and what will it brings to you and your users.

<!-- more -->

## Preambule

- Most of the present document apply for managed package developement for ISV, but you might find some practices and ideas that can apply to your workflow nonetheless.
- The semantic used in this document does not necessarly reflect the official Salesforce lexicon, don't use it as a reference.
- The source code of the example project used in this blogpost is available on [this GitHub repository](https://github.com/louis-bompart/lwc-structure).

## Phase 0: MDAPI Project

The MDAPI file structure is how files have been structured for a long time in Salesforce. Those files are sometimes bulky and hard to collaborate on. This why the Source Format was introduced with Salesforce DX.
If your project is still structured around the MDAPI format, switching to the source format might save you from numerous bad merge and headaches, and here are some resources to help you do it:
 - [Salesforce DX Project Structure and Source Format](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_source_file_format.htm), explains what is the Source Format.
 - [SDFX-CLI, mdapi Commands](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_mdapi.htm), some useful commands to work with your MDAPI files (`force:mdapi:convert` should be the one you want to check out).

## Phase  1: A monolithic package with a monolithic package directory structure

A 'monolithic package' is a single Salesforce package containing the integrality of your product. A monolithic directory is constituted of a single package directory (a directory containing for example the lwc or object folder).

It contains all the files related to your package in a single folder.

For example, here's what a simple project with a simple console application with a layout and some Lightning Web Components would look like:

![A classic force-app folder]({{ site.baseurl }}/images/2020-07-30-salesforce-package-development-model-for-isv/step1-directory.png)

### Pro
- It's simple.
- It's close to the MDAPI file structure (it'd be what you get from a `sfdx force:mdapi:convert` run even.).

### Con
- It's not scalable if you start getting a lot of features: If you have two distinct feature sets, you might want to split your files between those two, but you won't be able to do so, because the subfolder of **package directory** are expecting files matching their names (so, LWC bundles in the `lwc` folder, Aura bundles in `aura` folder, but no LWC in a subfolder like `lwc/subfolder/myComponent`).
- You have a single big package, which can be cumbersome for your users (e.g. they might want less static resources).

### First-Generation Managed package:
You should check the [First-Generation Managed Packages documentation](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_build_release.htm) from the Salesforce DX Developer Guide which goes in detail on how to deploy a managed 1st Gen package from the source format.

### Second-Generation Managed Packages:
You should check the [Second-Generation Managed Package documentation](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_dev2gp.htm) from the Salesforce DX Developer Guide which explains the release and publishing process of a 2nd Gen package.

## Phase 2: Monolithic managed package and feature-oriented directory structure.

A feature-oriented directory structure applies the [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) design principle to the directory structure of your SalesforceDX project.
It splits the files in different folders depending on their "raison d'être", meaning that if two components/classes have no relations between them, they should certainly be split in different folders.

For example, if you have some LWC components for Salesforce Community and others for Salesforce Lightning Console, chances are they should not be in the same folder.

If they have some shared code/logic, it could be split in a 'util' directory. Also, you can make multiple util directories. However, you should also apply the Separation of Concerns principle to those too.

So if we take the example from the [Phase 1](#Phase-1:-A-monolithic-package-with-a-monolithic-package-directory-structure), it would become like this:

![A force-app with multiple, well-scoped folders]({{ site.baseurl }}/images/2020-07-30-salesforce-package-development-model-for-isv/step-1-2-transition.png)

For this phase, the `sfdx-project.json` should stay the same and target the `force-app` folder as a whole:
```json
{
  "packageDirectories": [
    {
      "path": "force-app",
      "default": true
    }
  ],
  "namespace": "",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "48.0"
}
```
Even with the files distributed among different folders, the Salesforce-CLI stitch them together as one in the end. Thanks to that, when using `sfdx force:source:push` or publishing the package, the result will still be the same as in Phase 1.

### Pro
- The development is scalable, as a developer, this should prevent you from getting lost in your files.
- It should represent better what the client cares about and the different 'solutions' included in your package.
- It can be used with 1st or 2nd Generation Packaging

### Con
- It's quite different from the MDAPI file structure, so you might get confused at first if you're used to the latter.
- What you ship and your code are different, which is something to keep in mind.
- You still have a single big package, which can be cumbersome for your users (e.g. he might want less static resources).
- It can be used with 1st Generation Packaging (and of course we'd like to use the second!)


## Phase 3: Monolithic Second Generation Managed Package and feature-oriented directory structure.

If you are already using the Second Generation Packaging, there's nothing new between Phase 2 and this one.

If not, this phase would mostly be the migration from the First Generation Packaging to the Second. However, not much information has been shared on the topic yet apart for an upcoming [developer preview](https://releasenotes.docs.salesforce.com/en-us/summer20/release-notes/rn_sfdx_packaging_preview_package_migration.htm)

From there, we're assuming that you're using a 2GP.

### Pro
- Same as Phase 2, but also:
- It's using the Second Generation Packaging, which allows way more flexible and simpler package creation (see [Comparison of 2GP and 1GP Managed Packages](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_dev2gp_comparison.htm))
- Your source code is what you ship 🎉!

### Con

- You still have a single big package, which can be cumbersome for your users (e.g. he might want less static resources).

## Phase 4: Feature-oriented Second Generation Managed Packages and directory structure.

Finally, to ease the installation burden of your user, you can split your packages into smaller ones.

The directories created on phase 2 must now be defined as packages in the `sfdx-project.json`.
Those packages must explicitly specify their dependencies in the `sfdx-project.json`.

You should create 'empty' packages (later called 'feature set package') that group your features peruse cases, for example, if one of your personas is supposed to use multiple independent lightning components to have the best experience with one of your feature set, you should:
 - Split each of these independent lightning components in their own package.
 - Have an empty package that defines those packages as a dependency.

> That does not mean that you should have one package per component, but instead that you should ask yourself "Can my component be used as a standalone?".
>
> If the answer is yes, you may want to have a single package for it.

You can also add a 'demo' showing how to use them.
For example in the case of a record page, you could include a flexipage with your components properly setup.

For backward backward compatibility, you should create a `main` package that specifies all the feature set packages as dependencies.
![An empty main package]({{ site.baseurl }}/images/2020-07-30-salesforce-package-development-model-for-isv/step4-mainpackage.png)
> the `.placeholder` file is just there to ensure Git does commit the folder, you must also add it to your `.forceignore` file so that Salesforce CLI ignores it when pushing code.

In the end, with our example, it would look like this:
```json
{
  "packageDirectories": [
    {
      "path": "force-app",
      "default": true
    },
    {
      "package": "Main",
      "versionNumber": "0.0.0.NEXT",
      "path": "force-app/main/",
      "default": false
    },
    {
      "package": "FeatureSetA",
      "versionNumber": "0.0.0.NEXT",
      "path": "force-app/FeatureSetA/",
      "default": false,
      "dependencies": [
          {
            "package": "Feature1",
            "versionNumber": "0.0.0.LATEST"
          },
          {
            "package": "Feature2",
            "versionNumber": "0.0.0.LATEST"
          }
        ]
    },
    {
      "package": "Feature1",
      "versionNumber": "0.0.0.NEXT",
      "path": "force-app/Feature1/",
      "default": false,
      "dependencies": [
        {
          "package": "Utils",
          "versionNumber": "0.0.0.LATEST"
        }
      ]
    },
    {
      "package": "Feature2",
      "versionNumber": "0.0.0.NEXT",
      "path": "force-app/Feature2/",
      "default": false,
      "dependencies": [
        {
          "package": "Utils",
          "versionNumber": "0.0.0.LATEST"
        }
      ]
    },
    {
      "package": "Utils",
      "versionNumber": "0.0.0.NEXT",
      "path": "force-app/Utils/",
      "default": false
    }
  ],
  "namespace": "",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "48.0",
  "packageAliases": {
    "Main":"04tB00000000000",
    "FeatureSetA":"04tB00000000001",
    "Feature1":"04tB00000000002",
    "Feature2":"04tB00000000003",
    "Utils":"04tB00000000004"
  }
}
```

### Pro
- You ship smaller, self-contained features. That should allow better scalability, for the product and for your team. (i.e. more people can work on your project, and it can contain more stuff).
- Your client can reduce their installation size by installing only what they need.

### Con
- You have a lot of different packages, you must stay vigilant, or your project will become a mess.


## TL;DR and tips:
 - Use the Source Format today, if you don't already.
 - Use it smartly. Future you will thank you for splitting and structuring your code today.
 - Baby steps, do it progressively. The phases are more like milestones, meaning that, at least for the file structure,  you can be in-between two phases, with a 'historic' folder for what existed before you decided to use the feature-oriented file structure. And then, when developing new features, refactor their dependencies.