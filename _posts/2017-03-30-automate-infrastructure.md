---
layout: post

title: "Automate your infrastructure"

tags: [Automation, Devops, Coveo]

author:
  name: Serge Ohl
  bio: I am an engineer somewhere between code and infrastructure, but I have to admit I prefer one of them
  image: sohl.png
---

_In my life, I really love to automate recurring tasks. At home, I concept, build and develop my home automation since many years. At work, I automate all I can, scripts, servers, deploy. And now in the cloud, I am automating infrastructure._

It is not a new things, automation is old, but it's not in all data centers or cloud.
Let’s see why you have to automate your infrastructure, except because it's cool, there are other points to consider.

<!-- more -->

## Who have to automate infrastructure?

First point, everybody have to do automation, little company, big giant of web. Like I often hear **no matter the size**, this precept physiological is working here too. Infrastructure with 3 servers or 1000 servers, it is really the same thing, the same importance, and maybe most important for little infrastructure.

If you consider your infrastructure important, you must do it.


## What I have to automate?

Simple answer: **everything**. If you go to the way of automation you have to keep in mind than everything have to be automate. If there is human action, is it really automation ? Of course, you will have one human action to push on the button to launch the deploy, if I automate it I will lose my job.

If you can deploy your new application with one button and let operate the magic of automation but you have to add manually a new subnet or route, you failed. Reminder everything !


## Where I do that?

The easiest it is in the cloud, everybody heard about AWS, Google Cloud and other. The cloud was create for be modular and easy to use. All cloud provider have tool or API for help you to control their products. With AWS you can deploy without connect one time in the web console. Take the controls of all API.

By the way no excuse for private cloud or datacenter. I am in data center’s world since many years and I saw automation before the cloud advent. Now there are api everywhere, you can do automation, not easily, but you can. Ok except for add a server on a rack, it is hard to automate your techs.


## When I have to start ?

As soon as possible, like I said above do not wait to have 1000 servers to do automation, if you start soon it will easy for you to automate. My big issue today it is to automate a network creation, I can automate it but I have to create a new one and do a migration on this network. It’s like restart to zero.


## How do that ?

It a large topic, we can speak about cloud providers, tools, methods … For me the most important point is **take the time to think**. I saw too often people choose a techno or solution and go fast, do, re do and have workarounds on workarounds. Yes it is quick, there are results in few hours or days, but you lose in quality and you have to do changes too often.

Yes, we don’t have the time and it is for that it is better to take the time to think. You will have a solid infrastructure and you will return in code for add features not for debug your kraken.

I heard from here the dev teams say : Do it by iteration. Yes it is true and better for change management but you cannot do it if you didn’t think about what can be your infra for next years. How can you iterate without target?  Try to change the network topology after deploying without downtime.

Little tips, when you plan your infrastructure even if you have one server think how it will be with 100 servers.

## Why will you do that ?

It is a lot of work, it takes a lot of time, it legit to ask why I will automate all the infrastructure. There are answers for all positions in your company.
The dev teams will be happy to see the new features go to production quickly.
The security team happy to know than you can create all the infrastructure in case to disaster.
The ops team happy to have an easy way to maintain the infrastructure.
Your team happy to do cool stuff.
And of course your boss will happy to see everybody happy (if it's possible).


## Do what I said, not what I am doing ?

At Coveo I cannot say we have one button for deploy our application, but automation is everywhere. It an important topic and every body contribute it.

We had established target and now we are working hard for go to it. Not just with code, we changed our team organization for have Devops close by Dev team and we added an infra team for automate infra and build tools for devops/devteams.


## And you ?

I spoke with some Devops on other company, it's always very interesting to know where they are in their automations. Maybe you are Devops, do you have a full automate infra ?
