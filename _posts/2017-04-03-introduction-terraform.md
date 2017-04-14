---
layout: post

title: "Introduction to Terraform"

tags: [Terraform, Devops, Automation, AWS, Terraform]

author:
  name: Serge Ohl
  bio: I am an engineer somewhere between code and infrastructure, but I have to admit I prefer one of them
  image: sohl.jpg
---

_In a [previous post]({{ site.baseurl }}{% post_url 2017-04-14-automate-infrastructure %}) we talked about automating infrastructure, now let's see a tool we use to do it_

A few months ago, we started the project to automate all of our infrastructure. Where can we start? How to do it? What are the best tool? It is not easy to start, automate infrastructure is relatively new, tools too. Why did we choose Terraform?

<!-- more -->

## Context

At Coveo, like a lot of cloud companies, we use the AWS cloud. We have multiple environments for our release cycle to provide our clients different security levels, such as HIPAA. We want to be able to create our infrastructure and application in AWS regions quickly. To do that we have to see our infrastructure like code and have tools for that.


## The hard choice

I will do a confession; Terraform was not our first choice. A few months ago we started to check what tool existed to do **Infrastructure As Code** in AWS. And we found Terraform, CloudFormation, and many others. When we tried those softwares, our feeling were mitigate. No tool clould do all we wanted it to do.

It was the beginning of our own solution. We created a new software based on CloudFormation to be able to do what we want. After a while, we had a functional solution. It was a good wrapper on CloudFormation, but it took a lot of time to maintain it.

We decided to change and go to Terraform, because it is:
* one of most popular software
* there is a big community
* they offer integrations other providers than AWS
* there is support if we are stuck
* the syntax is simple (even too simple)
* it is open-source and we love that at Coveo


## Terraform introduction

We will not rewrite the Terraform Docs here, but it's interesting to know how it's working to understand how you can easily loosen your infrastructure.

Terraform has its own declarative language. For example, to create a security group, you declare where you want it (AWS) and then you create it.


```bash
# main.tf
# We define where we will create our resource
provider "aws" {
  region = "us-east-1"
}

# And we create a Security group
resource "aws_security_group" "demotf" {
  name        = "demotf"
  description = "A security group for demotf"
}
```


Now we can test if everything are ok with the command line `terraform`. Of course, you have to setup your AWS profile

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

The `plan` command will simulate the creation of resource with all file in the current directory with ending tf. As you can see there is a little `+` at begin of the line. Terraform will do this action in your AWS (`+` add, `-` destroy, `~` change). When you are satisfied with the plan, you can execute it for real with the command `terraform apply`.

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

Great, my security group is created. But did you see the paragraph after the result?
```
The state of your infrastructure has been saved to the path
below. This state is required to modify and destroy your
infrastructure, so keep it safe. To inspect the complete state
use the `terraform show` command.

State path: terraform.tfstate
```

Terraform creates a state file in your directory. It is a image in JSON of all resources created by Terraform.

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

This file seems great, but trust me, it will be your enemy. A big file with all your configurations, all your definitions, all IDs, and of course all passwords, certificates, keys in clear text lost somewhere in a computer... I don't know for you but at Coveo, this is a big security breach. We will see in another post how to handle that. Keep in mind that all your infrastructure are this file, terraform will not be able to change anything.

Now, we change change our security group to add a rule,  for example:

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

Test it with `terraform plan` and apply it

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

And of course, we can delete it, but with the  `delete` command, you cannot test it.

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
When you ask to destroy, terraform does not list what it will destroy. It will get all resources in the statefile and delete them.
After the `yes`, your AWS account will be clean, like we did nothing.


## Tips to start with Terraform

Always test your code with **terraform plan** and read the result. Terraform has to delete/create some resources because we can update it.   

Take care of your statefile, you lose it,  you lose your infrastructure.


## Is it the best choice ?

Now, we are working with Terraform, sometimes better than our in-house solution, sometimes less. I am often impressed by some missing features, for example, you cannot easily create a resource depending on a condition. You cannot work with a variable and save it on an other variable, etc.

I don't know the history of this tool, but I really think, at beginning, it was created to work alone and it continued to grow with this base. In the last release of terraform, hasicorp added remote statefile and lock on this file, it seems like a workaround to add the possibility to work in team. Not a real solution.

But we are not masochist, this tool has a lot of good things:
* it is easy to write and read
* you can build an architecture with modules
* you can import existing resources
* with all providers, you can manage other things than AWS
* there is a module versioning handler
* we don't have to maintain it

It's not the perfect tool but it has a big community and it grows. It also gets new providers and functions periodically.

Did you find some limitations too?
