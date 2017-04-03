---
layout: post

title: "Introduction to Terraform"

tags: [Terraform, Devops, Automation, AWS, Terraform]

author:
  name: Serge Ohl
  bio: I am an engineer somewhere between code and infrastructure, but I have to admit I prefer one of them
  image: sohl.png
---

_In a [previous post]({{ site.baseurl }}{% post_url 2017-03-30-automate-infrastructure %}) we talked about automate infrastructure, now let's see a tool we use for do it_

Few months ago, we started the project to automate all our infrastructure. Where can we start ? How do it ? What the best tool ? It is not easy to start, automate infrastructure is relatively new, tools too. Why did we choose Terraform ?

<!-- more -->

## Context

At Coveo like, a lot of cloud companies, we are in the AWS cloud. And we have multiple environments for our release cycle and to provide to our clients different security levels (like hipaa). We want to be able to create our infrastructure and application in AWS region quickly. To do that we have to see our infrastructure like code and have tool for that.


## The hard choice

I will do a confession, Terraform is not our first choice. Few months ago we started to check what tool exists to do **Infrastructure As Code** at AWS. And we found Terraform, CloudFormation and many others. When we tried those softwares, our feeling was mitigate. No one can do all we want.

It was the begin of our own solution, we created a new software based on CloudFormation to be able to do what we want. After a while, we had our functional solution. It was a good wrapper on CloudFormation, but it took a lot of time to maintain it.

We decided to change and go to Terraform, because it is :
* one of most popular software
* there is a big community
* it's not just for AWS, there are a lot of provider
* there is support if we are stuck
* the syntax is simple (even too simple)
* open-source and we love that at Coveo


## Terraform introduction

We will not rewrite the Terraform Docs here, but it's interesting to know how it's working for understand how you can easily loose your infrastructure.

Terraform have is own language, a declarative language. For example, to have a security group, you say where you want it (aws) and after you create it.


```bash
# main.tf
# We define were we will create our resource
provider "aws" {
  region = "us-east-1"
}

# And we create a Security group
resource "aws_security_group" "demotf" {
  name        = "demotf"
  description = "A security group for demotf"
}
```


Now can test if all are ok with the command line terraform. Of course you have to setup your AWS profile

```bash
terraform plan

+ aws_security_group.demotf
    description: "A security group for demotf"
    egress.#:    "<computed>"
    ingress.#:   "<computed>"
    name:        "demotf"
    owner_id:    "<computed>"
    vpc_id:      "<computed>"

Plan: 1 to add, 0 to change, 0 to destroy.
```

The **plan** command will simulate the creation of resource with all file in the current directory with suffix tf. As you can see there is a little + at begin of the line, terraform will do this action in you AWS (+ add, - destroy, ~ change). If you are satisfied by the plan, you can do it for real.

```bash
terraform apply

aws_security_group.demotf: Creating...
  description: "" => "A security group for demotf"
  egress.#:    "" => "<computed>"
  ingress.#:   "" => "<computed>"
  name:        "" => "demotf"
  owner_id:    "" => "<computed>"
  vpc_id:      "" => "<computed>"
aws_security_group.demotf: Creation complete

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

Great, my security group is created. But did you see the paragraph after the result ?
```
The state of your infrastructure has been saved to the path
below. This state is required to modify and destroy your
infrastructure, so keep it safe. To inspect the complete state
use the `terraform show` command.

State path: terraform.tfstate
```

Terraform create a state file in your directory. It is a image in json of all resources create by terraform.

```json
{
    "version": 3,
    "terraform_version": "0.8.8",
    "serial": 0,
    "lineage": "3725b733-c153-49c6-bbfd-28c82fe2f2bc",
    "modules": [
        {
            "path": [
                "root"
            ],
            "outputs": {},
            "resources": {
                "aws_security_group.demotf": {
                    "type": "aws_security_group",
                    "depends_on": [],
                    "primary": {
                        "id": "sg-xxxxxxxxx",
                        "attributes": {
                            "description": "A security group for demotf",
                            "egress.#": "0",
                            "id": "sg-xxxxxxxxx",
                            "ingress.#": "0",
                            "name": "demotf",
                            "owner_id": "xxxxxxxxxxx",
                            "tags.%": "0",
                            "vpc_id": "vpc-xxxxxxx"
                        },
                        "meta": {},
                        "tainted": false
                    },
                    "deposed": [],
                    "provider": ""
                }
            },
            "depends_on": []
        }
    ]
}
```

This file seems great, but trust me it will be your enemy. A big file with all your configurations, all your definitions, all IDs and of course all passwords, certificates, keys in clear text lost somewhere in a computer... I don't for you but for us at Coveo is a big security breach. We will see in another post how handle that. Keep in mind all your infrastructure are this file, terraform will not be able to change anything.

Now we change change our security group to add a rule for example :

```bash
# main.tf
# We define were we will create our resource
provider "aws" {
  region = "us-east-1"
}

# And we create a Security group
resource "aws_security_group" "demotf" {
  name        = "demotf"
  description = "A security group for demotf"

  # Don't do that in real life it can be dangerous
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["192.168.0.0/16"]
  }
}
```

Test it with **teraform plan** and apply it

```bash
~ aws_security_group.demotf # <-- look the ~ for change
    ingress.#:                            "0" => "1"
    ingress.3308487977.cidr_blocks.#:     "0" => "1"
    ingress.3308487977.cidr_blocks.0:     "" => "192.168.0.0/16"
    ingress.3308487977.from_port:         "" => "0"
    ingress.3308487977.protocol:          "" => "-1"
    ingress.3308487977.security_groups.#: "0" => "0"
    ingress.3308487977.self:              "" => "false"
    ingress.3308487977.to_port:           "" => "0"


Plan: 0 to add, 1 to change, 0 to destroy.
```

And of course  we can delete it, but for delete you cannot test it.

```bash
terraform destroy
Do you really want to destroy?
  Terraform will delete all your managed infrastructure.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value: yes

aws_security_group.demotf: Refreshing state... (ID: sg-18d34c67)
aws_security_group.demotf: Destroying...
aws_security_group.demotf: Destruction complete

Destroy complete! Resources: 1 destroyed.
```
When you ask for destroy, terraform does not list what it will destroy. It will all resources in the statefile and delete it.
After the 'yes' your AWS account is like we did nothing with terraform.


## Tips to start with Terraform

Always test your code with **terraform plan** and read the result. Terraform have to delete/create some resources because we can update it.   

Take care about your statefile, you loose it you loose your infrastructure.


## It is the best choice ?

Now we working with Terraform, sometimes better than our solution, sometimes less. I am often impressive about the stupidity of the tool. Example, you cannot easily create conditionally a resource, you cannot work with variable and save it on an other variable, etc.

I don't know the historic of this tool but I really think, at begin, it was created for work alone and it continue to grow with this base. In the last release of terraform, hasicorp added remote statefile and lock on this file, for us it's a workaround.

But we are not masochist, this tool has a lot of good things :
* it is easy to write and read
* you can build an architecture with modules
* you can import existing resource
* with all provider you can manage other thing than AWS
* there is a module versioning handler
* we don't have to maintain it

It's not the perfect tool but it has a big community and it grows. Terraform add new providers and functions.

Did you find some limitations too ?
