---
layout: post

title: "Create a module Terraform"

tags: [Automation, Devops, Coveo, Terraform]

author:
  name: Serge Ohl
  bio: I am an engineer somewhere between code and infrastructure, but I have to admit I prefer one of them
  image: sohl.png
---

_Since months ago, I started to create an architecture with Terraform and like in other programming languages I am lazy and I want to do a for loop. :sonaive:_


## There is not for

I was really surprise when I saw than the for loop doesn't exist in Terraform. I really don't want to create a variable list of resources by hand. They cannot miss this "feature", it is developers behind this tool.

In the documentation, I found the keyword `count`. All loop system is based on this keyword. It is basic, you define your resource like ec2, add count = 2. After a terraform plan you will have two instances ec2 with the same settings.
```bash
resource "aws_instance" "server" {
  count="2"
  ami = "ami-f4cc1de2"
  instance_type = "t2.micro"

  tags {
    Name = "Server1"
  }
}
```

We have one definition for 2 servers, but all settings are the same, even the name. Hopefully, there is a set of variable with the count, like index.
```bash
resource "aws_instance" "server" {
  count="2"
  ami = "ami-f4cc1de2"
  instance_type = "t2.micro"

  tags {
    Name = "Server${count.index}"
  }
}
```
The result is two instances with the name Server0 and Server1. If you want to start from 1 and not 0 add + 1

```bash
  tags {
    Name = "Server${count.index + 1}"
  }
}

Result:
Server1
Server2
```

I don't know for you, but me I like beautiful resource name. I don't like server1, server10, server100. I want server001, server010 and server100. A lot of tool use alphabetical order to sort and display.

There is a function format to help you to have the prefect name.
```bash
tags {
    Name = "Server${format("%03d", count.index +1)}"
  }

Result:
Server001
Server002
...
Server012
...
Server152
```

# Count and list

Another issue I had: I want add multiple routes in a route table, and this list of route is dynamics.

First create your input variable as list in your interfaces.tf
```bash
#interfaces
variable "routes" {
  description = "All our local routes"
  type = "list"
  default= [
    "192.168.0.0/24",
    "10.55.0.0/16",
    "192.168.25.36/32"
  ]
}
```

And create resources
```bash
resource "aws_route" "routes" {
  count                  = "${length(var.routes)}"
  route_table_id         = "rtb-IDIDIDID"
  destination_cidr_block = "${element(var.routes, count.index)}"
}
```

We use the length of our list to determine the number of route ,and with the function element, we ask the value at the 'count.index' to the 'var.routes'.

# Count is useful, but ..

The count is almost like a for loop, but we can use it everywhere. For example, I want to create 2 routes tables with my list of routes. I can't do it in one resource, count of count is not working. I have to create my tables with the count and after my route like our example.

With some resources you cannot do it, because it is not possible to separate in two resources. Conclusion you can do a for in a for.

And most frustrating, count is not supported on module. I wrote a module to handle the creation of my subnets. I want to call the module n times with a list of CIDR, but I cannot, count is not an attributes of module. You have to duplicate the module call. So ugly.

```bash
# this is not working
module "subnet"{
  source = './subnet'
  count  = "${length(var.subnets)}"
  cidr   = "${element(var.subnets, var. count.index)}"
}
```

# Conclusion

Count is the only alternative to for loop, but keep in mind: as some limitations and you cannot use it everywhere

Do you think it is missing others things ?
