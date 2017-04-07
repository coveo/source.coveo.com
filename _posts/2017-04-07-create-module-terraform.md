---
layout: post

title: "Create a module Terraform"

tags: [Automation, Devops, Coveo, Terraform]

author:
  name: Serge Ohl
  bio: I am an engineer somewhere between code and infrastructure, but I have to admit I prefer one of them
  image: sohl.png
---

_There are multiple ways to use Terraform and manage the code. The ugly and the beautiful_

It is easy to create Terraform code, plan, apply and push in a repo. But can you share your code ? Can you use it in another AWS region ? Can you merge your shared code without break anything ?

<!-- more -->

## Build a module

In many programming languages, the way to have sharable code is the modules. Terraform also support  code as module, and guess what ? It is really easy to write one.

We already saw in the [introduction]({{ site.baseurl }}{% post_url %}) when you use Terraform in a directory it will read all file prefixed by tf. It is the same thing in a module except there are multiple folders. If I take the same example as in the [introduction]({{ site.baseurl }}{% post_url %}), we will create a module for handling an AWS security group.

This is our module files hierarchy
```
-/serurity-group <-- module folder
 --| main.tf  <-- Terraform code
```

In the main.tf, nothing new, a piece of code to create a security group.

```bash
# main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_security_group" "demotf" {
  name        = "demotf"
  description = "A security group for demotf"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["192.168.0.0/16"]
  }
}
```
Congratulation your first module is created.

Now we have to call it. To do that we need a terraform file. Create a file infra.tf.
```
-/serurity-group
 --| main.tf  
|infra.tf
```
It this file we will call our module
```bash
# infra.tf
 module "security_group" {
   source = "./serurity-group" # <-- relative path to our module folder
 }
```
Test a plan, you should see the creation of a security group.
The source variable can be a local directory, a git or mercurial repo, http urls, s3 bucket. If you use a repository you can specify a branch, commit, tag(version), etc.

We have a module but it is not really modular.  Adding some variable will make it more modular. Let's make it that way.

First our infra.tf. We add argument in our module definition.
```bash
# infra.tf
 module "security_group" {
   source = "./serurity-group"

   name = "SG-Demo" #<-- you can name the variable like you want
 }
```

Now we have to add it on the module. Add a file name interfaces.tf.
The names don't have any importance. Remember, terraform will get all tf files. One of the best practices I can give you is to name your entrypoint "main.tf" and your module interface definition in "interfaces.tf",this one will contain variables and output, kinda like a Oriented Object interface

```bash
-/serurity-group
 --| main.tf
 --| interfaces.tf  
|infra.tf
```

```bash
# interfaces.tf
variable "name" {
  description = "Name for the security group."
}
```

It is important to add descriptions, first when you miss a variable and you try a terraform plan, Terraform will ask to set the variable and display the description. This can be a great help when somebody will use our module without knowing what it do.

```bash
terraform plan
var.name
  Name for the security group.

  Enter a value:
```

We can use this variable in our module with the prefix var.

```bash
provider "aws" {
  region = "us-east-1"
}

resource "aws_security_group" "demotf" {
  name        = "${var.name}"
  description = "A security group for ${var.name}"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["192.168.0.0/16"]
  }
}
```

Now we can add new security group without copy all code. Ok security group with same permission have not reason to exist, it is just for the example.
```bash
# infra.tf
module "security_group" {
 source = "./serurity-group"

 name = "SG-Demo"
}

module "security_group2" { #<-- module can't have the same name
 source = "./serurity-group"

 name = "SG-Demo2"
}
```

We call 2 times the security group module, and in the security group we set the provider. So we set the provider 2 times. Right now, we just call one module in our infra.tf and I think you will have more than one module in your AWS infrastructure. We don't want to set the provider in each module.

The solution is easy remove the provider to module ...

```bash
resource "aws_security_group" "demotf" {
  name        = "${var.name}"
  description = "A security group for ${var.name}"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["192.168.0.0/16"]
  }
}
```
... and put it in infra.tf
```bash
# infra.tf
provider "aws" {
  region = "us-east-1"
}

module "security_group" {
 source = "./serurity-group"

 name = "SG-Demo"
}

module "security_group2" {
 source = "./serurity-group"

 name = "SG-Demo2"
}
```

All module will inherit the provider. Warning, it is not working for variables. If you create a variable on infra.tf, it will be inaccessible from module,  if you don't give it in definition.

So we have a module who will create two security groups in a region. A nice module can be region agnostic, for that we can transform our infra.tf to module and add region as variable.

First we change the hierarchy infra is our module now and security group is a submodule.
```bash
/infra
--| main.tf #<-- Rename infra.tf to main.tf
--| interfaces.tf #<-- Add variable for region
--/serurity-group
  --| main.tf
  --| interfaces.tf  
```

```bash
variable "region" {
  default = 'us-east-1'
  description = "Region AWS where all resources will be create."
}
```
As you can see we added a default value, like that terraform will not ask us to set a region and we can override this variable.

Add the region variable in provider.

```bash
# main.tf
provider "aws" {
  region = "${var.region}"
}

module "security_group" {
 source = "./serurity-group"

 name = "SG-Demo"
}

module "security_group2" {
 source = "./serurity-group"

 name = "SG-Demo2"
}
```

Finally we have a region agnostic module to create the base of our new infrastructure. You can add all resources you need.

## Override

If we want create the same infra in another region we just have to override the region. Terraform let us multiple ways to override, by environment's variable, add variable in your command terraform, add a variable file, ...

Our favorite solution is a to add a variable file (.tfvars), in our case we have just one variable but as you can imagine there will have more than one. And a file all variable in a file is the most elegant solution.

Add a file us-east-2.tfvars at the root of your module infra.
```bash
# us-east-2.tfvars
region = "us-east-2"
```

And call Terraform with this file in option
```bash
terraform plan -var-file=us-east-2.tfvars
```
Like that the region will be override by the 'us-east-2'. And of course you can add multiple variables in the tfvars. It is not 1 variable = 1 file.


## Best practices

Name main.tf your entry point of the module
Name interfaces.tf you input/output variables
Always add a description to variables
