---
layout: post

title: "Continuous Integration of a Sitecore Project Using AppVeyor"
tags: [Sitecore, Continuous Integration, AppVeyor, GitHub, NuGet]

author:
  name: Jean-François L'Heureux
  bio: Tech Evangelist, Coveo for Sitecore Team
  twitter: jflh
  image: jflheureux.jpeg
---

Continuous integration (CI) is the act of automatically compiling code and running its tests every time a change is made. It is an important step in a project to ensure quality and save time. It needs to be implemented before continuously deploying an application.

[AppVeyor](https://www.appveyor.com/) is a continuous integration cloud service. It is free for public repositories. One of its key feature is the support of Windows, .net, Visual Studio, and MSBuild. It is a perfect tool for a Sitecore project.

Let's explore how to use it with the Sitecore Habitat demo project.

<!-- more -->

## Creating a project

AppVeyor supports sign in with your VSTS, Bitbucket, or GitHub account. Once logged in, you can create a continuous integration project for any of your repositories. It supports a wide range of repositories sources. Here, I choose my GitHub Habitat fork.

![Add an AppVeyor project from GitHub](/images/20170922-appveyor/AppVeyor-CreateProject.png)

## Configuring the project

AppVeyor has a complete settings user interface. It also supports storing the project configuration in an `appveyor.yml` file at the root of your repository. I recommend the configuration file for many reasons:

* You have a complete view of all the configuration instead of having to navigate the various UI sections.
* You can always view and modify your configuration, even when you work offline.
* Every time you push a modification to the file, it automatically builds your project.
* A contributor forking your project can also easily use AppVeyor to continuously integrate his work.

You should note that the file is not merged with the UI settings except for the environment variables and notification settings. Build version format is taken from UI if it is not set in the file.

The configuration file requires only a few settings to get started.

```yml
branches:
  only:
    - master

image: Visual Studio 2017

build:
  project: Habitat.sln
```

I specify to compile the `Habitat.sln` solution on an environment with Visual Studio 2017 and to only run for the master branch commits.

Running the AppVeyor project with this configuration unveils a first problem.

```
Build started
git clone -q --branch=master https://github.com/jflheureux/Habitat.git C:\projects\habitat
git checkout -qf 23c3002eceffe483e2b46df74f040668d1c00193
msbuild "C:\projects\habitat\Habitat.sln" /logger:"C:\Program Files\AppVeyor\BuildAgent\Appveyor.MSBuildLogger.dll"
Microsoft (R) Build Engine version 15.3.409.57025 for .NET Framework
Copyright (C) Microsoft Corporation. All rights reserved.
Building the projects in this solution one at a time. To enable parallel build, please add the "/m" switch.
Build started 9/21/2017 2:30:34 PM.
Project "C:\projects\habitat\Habitat.sln" on node 1 (default targets).
ValidateSolutionConfiguration:
  Building solution configuration "Debug|Any CPU".
Project "C:\projects\habitat\Habitat.sln" (1) is building "C:\projects\habitat\src\foundation\SitecoreExtensions\code\Sitecore.Foundation.SitecoreExtensions.csproj" (2) on node 1 (default targets).
PrepareForBuild:
  Creating directory "bin\".
  Creating directory "obj\Debug\".
Project "C:\projects\habitat\src\foundation\SitecoreExtensions\code\Sitecore.Foundation.SitecoreExtensions.csproj" (2) is building "C:\projects\habitat\src\Foundation\DependencyInjection\code\Sitecore.Foundation.DependencyInjection.csproj" (3:2) on node 1 (default targets).
C:\projects\habitat\src\foundation\DependencyInjection\code\Sitecore.Foundation.DependencyInjection.csproj(155,5): error : This project references NuGet package(s) that are missing on this computer. Use NuGet Package Restore to download them.  For more information, see http://go.microsoft.com/fwlink/?LinkID=322105. The missing file is ..\..\..\..\packages\Microsoft.Net.Compilers.1.3.2\build\Microsoft.Net.Compilers.props. [C:\projects\habitat\src\Foundation\DependencyInjection\code\Sitecore.Foundation.DependencyInjection.csproj]
_CleanRecordFileWrites:
  Creating directory "obj\Debug\".
Done Building Project "C:\projects\habitat\src\Foundation\DependencyInjection\code\Sitecore.Foundation.DependencyInjection.csproj" (default targets) -- FAILED.
Done Building Project "C:\projects\habitat\src\foundation\SitecoreExtensions\code\Sitecore.Foundation.SitecoreExtensions.csproj" (default targets) -- FAILED.

...

    18 Warning(s)
    23 Error(s)

Time Elapsed 00:00:11.54
Command exited with code 1
```

## Restoring NuGet packages

Habitat relies on public NuGet packages from NuGet.org and the Sitecore NuGet feed. These sources are configured in the `nuget.config` file of the Habitat repository and NuGet automatically handles this file. To restore the packages in AppVeyor, you must add a command line instruction to run in the `before_build` section:

```yml
before_build:
  - nuget restore Habitat.sln
```

### Caching

The NuGet packages will rarely change in your project. To speed up the builds, it is recommended to cache the packages between builds. This is done in the `cache` section:

```yml
cache:
  - packages -> **\packages.config  # preserve NuGet packages in the root of build folder but will reset it if any packages.config file is modified
  - '%LocalAppData%\NuGet\Cache'    # NuGet < v3
  - '%LocalAppData%\NuGet\v3-cache' # NuGet v3
```

This time, the build is successful but the unit tests are failing.

```
Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:02:33.21
Discovering tests...OK
%xunit20%\xunit.console.x86 "C:\projects\habitat\src\Feature\Accounts\Tests\bin\Debug\Ploeh.AutoFixture.Xunit2.dll" -appveyor
xUnit.net Console Runner (32-bit .NET 4.0.30319.42000)
System.IO.FileLoadException: Could not load file or assembly 'xunit.core, Version=2.0.0.2929, Culture=neutral, PublicKeyToken=8d05b1bb7a6fdb6c' or one of its dependencies. The located assembly's manifest definition does not match the assembly reference. (Exception from HRESULT: 0x80131040)
Command exited with code 1
```

## Choosing tests

AppVeyor automatically tries to detect the assemblies containing unit tests. In some cases, you must help it in the `test` section:

```yml
test:
  assemblies:
    only:
      - \src\**\Tests\bin\**\Sitecore.*.Tests.dll
```

Habitat has a very good naming convention that helps you configure the list of assemblies to test. This time, the unit tests complain about the missing Sitecore license.

```
Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:02:31.75
Discovering tests...OK
%xunit20%\xunit.console.x86 "C:\projects\habitat\src\Feature\Accounts\Tests\bin\Debug\Sitecore.Feature.Accounts.Tests.dll" -appveyor
xUnit.net Console Runner (32-bit .NET 4.0.30319.42000)
  Discovering: Sitecore.Feature.Accounts.Tests
  Discovered:  Sitecore.Feature.Accounts.Tests
  Starting:    Sitecore.Feature.Accounts.Tests

    Sitecore.Feature.Accounts.Tests.Attributes.RedirectAuthenticatedAttributeTests.OnActionExecuting_AuthenticatedUser_ShouldRedirect(db: master, item: [], filterContext: ActionExecutingContextProxy { __interceptors = [CastleForwardingInterceptor { ... }], __mixin_NSubstitute_Core_ICallRouter = CallRouter { }, ActionDescriptor = ActionDescriptorProxy { __interceptors = [...], __mixin_NSubstitute_Core_ICallRouter = CallRouter { ... }, ActionName = "", ControllerDescriptor = ControllerDescriptorProxy { ... }, UniqueId = "" }, ActionParameters = [], Controller = null, ... }, redirectAuthenticatedAttribute: RedirectAuthenticatedAttribute { AllowMultiple = False, Order = 185, TypeId = typeof(Sitecore.Feature.Accounts.Attributes.RedirectAuthenticatedAttribute) }) [FAIL]
      Sitecore.SecurityModel.License.LicenseException : Required license is missing: Runtime
```

## The Sitecore license

As you don't want to share your Sitecore license to the rest of the world, you don't store it in your repository. The AppVeyor solution for private files is to commit an encrypted version and add a decryption step in the `install` section, before the project is built:

```yml
install:
  - nuget install secure-file -ExcludeVersion
  - secure-file\tools\secure-file -decrypt .\lib\license.xml.enc -secret "%LicenseEncryptionKey%"
```

[secure-file](https://www.appveyor.com/docs/how-to/secure-files/) is an AppVeyor tool to encrypt and decrypt files using a private encryption key. Usage is simple but tricky.

### Encryption key

1. Choose a long enough key for your files to be secure.
2. Choose a key shorter than 32K characters as it will be stored as an environment variable. There is only 32K to store all the environment variables on Windows. Be considerate.
3. Avoid special characters like ``/ \ | ~ % < > ` ' "`` in your encryption key as it is passed as a command line argument.
4. Avoid the `^` character as AppVeyor will strip it from your environment variable.

### Environment variable

The encryption key must be stored securely in AppVeyor and not be visible in the build logs. Environment variables are perfect for this. It is one of the only setting that is merged between the UI and the configuration file.

![Add an AppVeyor project from GitHub](/images/20170922-appveyor/AppVeyor-EnvironmentVariable.png)

Here I choose to name my environment variable `LicenseEncryptionKey`. You have to set its value.

### Installing on your local computer

As you need to encrypt your files locally, you need the tool as well. Run this command in a console:

```
nuget install secure-file -ExcludeVersion
```

### Encryption

Habitat gulp script copies the Sitecore license file from your webroot to the `lib` folder of the devroot.

Encrypt your Sitecore license file using this command. The location of the file may vary. Replace `YOUR_ENCRYPTION_KEY` by the one you defined earlier.

```
secure-file\tools\secure-file -encrypt .\lib\license.xml -secret "YOUR_ENCRYPTION_KEY"
```

### Moment of truth

Commit and push the resulting `license.xml.enc` file. Your unit tests should now run successfully.

```
...

%xunit20%\xunit.console.x86 "C:\projects\habitat\src\Foundation\Theming\tests\bin\Debug\Sitecore.Foundation.Theming.Tests.dll" -appveyor
xUnit.net Console Runner (32-bit .NET 4.0.30319.42000)
  Discovering: Sitecore.Foundation.Theming.Tests
  Discovered:  Sitecore.Foundation.Theming.Tests
  Starting:    Sitecore.Foundation.Theming.Tests
  Finished:    Sitecore.Foundation.Theming.Tests
=== TEST EXECUTION SUMMARY ===
   Sitecore.Foundation.Theming.Tests  Total: 12, Errors: 0, Failed: 0, Skipped: 0, Time: 3.742s
Updating build cache...
Cache 'packages' - Up to date
Cache 'C:\Users\appveyor\AppData\Local\NuGet\Cache' - Up to date
Cache 'C:\Users\appveyor\AppData\Local\NuGet\v3-cache' - Up to date
Build success
```

## Improving build performance

By default, the log level is very verbose. For improved build time, you can set the build verbosity in the `build` section:

```yml
build:
  verbosity: minimal
```

If the build fails in the future and the logs are not verbose enough, you can temporarily comment this line.

## Final configuration file

```yml
branches:
  only:
    - master

image: Visual Studio 2017

cache:
  - packages -> **\packages.config  # preserve NuGet packages in the root of build folder but will reset it if any packages.config file is modified
  - '%LocalAppData%\NuGet\Cache'    # NuGet < v3
  - '%LocalAppData%\NuGet\v3-cache' # NuGet v3

install:
  - nuget install secure-file -ExcludeVersion
  - secure-file\tools\secure-file -decrypt .\lib\license.xml.enc -secret "%LicenseEncryptionKey%"

before_build:
  - nuget restore Habitat.sln

build:
  project: Habitat.sln
  verbosity: minimal

test:
  assemblies:
    only:
      - \src\**\Tests\bin\**\Sitecore.*.Tests.dll
```

## Packaging build artifacts

When a build is successful, AppVeyor can package the artifacts and publish them in its cloud storage. I have yet to try this feature. It will be part of a separate post.

## Conclusion

Before using AppVeyor, I tried to setup another local continuous integration tool. After countless hours, it was still not working. I was discouraged and had hard feelings towards continuous integration.

Needless to say I was happy and impressed by AppVeyor. It took me under 4 hours to learn the basics and have my first successful build of the Sitecore Habitat project. I really like the product as it has a low barrier of entry, and the fact that it is free for public repositories. I plan to use it for a more complex Sitecore project in the near future. Stay tuned as I share my experiences as I progress.

I encourage everybody who believe continuous integration is hard to try AppVeyor and experience how easy it can be.