---
layout: post

title: "Creating a WSL distribution from a Dockerfile"

tags: [WSL Docker Builds CrossPlatform]

author:
  name: Francois Rivard
  bio: Software Developer
  image: frivard.png
---

## The problem

Setting up a new computer is always long and difficult. From time to time, a new developer joins the team and must setup his computer to build the code from the team's repository. This can be a long and frustrating exercise. This is even more difficult when the code is cross-platform and has to be built under Linux and Windows.

<!-- more -->

## Leveraging the existing tools

Windows users can leverage a technology called [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/faq) to easily switch between Windows and Linux tools. It is possible to run multiple Linux distributions simultaneously, making it great for cross-platform development.

Setting up the Linux distribution remains just as difficult as setting up a new Linux computer. 

To ease the task, one can use Docker tools to describe the configuration of the distribution in a [dockerfile](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/). This dockerfile details each library to install, all the tools to download and extract, as well as the necessary environment variables. 

Usually, this container image is used by the [CI system](https://jenkins.io/download/) to build the code on every commit.

In this post, I will show how to transform a dockerfile into a WSL distribution in an automated fashion. This allows the Windows developer to build and test the code on Linux using the same build environment as the CI system.

## Overview of the procedure

Let's assume that the team already has Docker images used by the CI system to build the code. The procedure is (almost) as simple as:

1. Build the Docker image from the Dockerfile.
2. Run the newly created image in a container.
3. Export the container filesystem using 'docker export' command. 
4. Import the filesystem in WSL using 'wsl --import' command.

```
docker build --file $containerName.dockerfile --tag $imageTag .
docker run --name $containerName $imageTag
docker export --output=$distroName.tar $containerName
```
```
wsl.exe --import $distroName $installLocation $distroName.tar
```

Of course, if it was that easy, I wouldn't be writing a post about it, right? Some of the issues with this procedure:
- Environment variables defined in the Dockerfile are lost
- If the CI system is running in an [AWS EC2](https://aws.amazon.com/ec2/) instance, the AWS profile/credentials are lost
- The export and import are done on different computers in real life.

So let's take a closer look at each issue and how to solve them.

## Environment Variables

The environment variables are not saved in the filesystem by Docker. They are in the image metadata and applied at runtime, but only in-memory. To retrieve them, the [`docker inspect`](https://docs.docker.com/engine/reference/commandline/inspect/) command is used, along with some [golang goodness](https://golang.org/pkg/text/template/) to format the output.
- Create a file containing the export definition of the variables
```
docker inspect --format="{% raw %}{{range .Config.Env}}{{printf \"export %s\n\" .}}{{end}}{% endraw %}" $containerName > vars.txt
```
- Get the current global profile
```
docker cp $containerName:/etc/profile oldvars.txt
```
- Update the global profile
```
cat oldvars.txt vars.txt > newvars.txt
docker cp newvars.txt $containerName:/etc/profile
```

## AWS credentials

The goal is to re-use the AWS credentials of the Windows user inside of the WSL distribution. On an EC2 instance using an [instance profile](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html), the AWS command-line tools hit a [local URI](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html) to determine the access keys to use. But for a developer, they will usually have their own configuration files in their home folder. It is thus necessary to link the Windows home folder to the Linux home folder, and share the AWS_PROFILE environment variable. In Powershell, this looks like:
```
Write-Host "Symlink for AWS config..."
$translatedHome = "/mnt/" + ${env:USERPROFILE}.Replace("C:","c").Replace("\","/")
wsl -d $distroName "ln" "-s" "${translatedHome}/.aws" "~/.aws"
Write-Host "Sharing AWS profile..."
$newValue = ""
if($env:WSLENV) {
    if(!($env:WSLENV.Contains("AWS_PROFILE"))) {
        $newValue = "${env:WSLENV}:AWS_PROFILE/u"
    }
} else {
    $newValue = "AWS_PROFILE/u"
}
if(![string]::IsNullOrEmpty($newValue)){
    [System.Environment]::SetEnvironmentVariable("WSLENV", $newValue, "User")    
}
```

## Exporting and importing

The easy part! On the CI server, the tarball is simply gzipped then uploaded to an [S3 bucket](https://aws.amazon.com/s3/), and on Windows the tar.gz file is directly imported.
```
gzip $distroName.tar
aws s3 cp $distroName.tar.gz s3://$bucketName/$distroName.tar.gz
```
```
Write-Host "Importing WSL distro"
$distroOnS3 = "s3://${bucketName}/${distroName}.tar.gz"
aws s3 cp $distroOnS3 ${distroName}.tar.gz
$installLocation = Join-Path "${env:LOCALAPPDATA}" "MyCompany" $distroName
wsl.exe --import $distroName $installLocation ${distroName}.tar.gz
```

## Wrapping up

We have shown how to take a typical Dockerfile used on the CI server, and transform it into a fully functional WSL distribution. The Windows developers can then compile and test on their computer Windows and Linux binaries, without spending the whole day (or week!) trying to setup their computer. This time saving becomes a great efficiency boost as your team grows.
