---
layout: post

title: "Checkov as a Terragrunt hook, Sec in your DevSecOps!"

tags: [DevSecOps,Security,IaC,Terraform,Terragrunt]

author:
  name: Jean-Philippe Lachance
  bio: Team Lead, R&D Security Defense
  twitter: JeePLachance
  image: jplachance.jpg
---

I was trying to find a good introduction for this blog post, so I did what I do when I need to write a complex piece of code: a Google search! My search was DevSecOps. One of the first results was [this article](https://www.redhat.com/en/topics/devops/what-is-devsecops) on the RedHat website.

Basically, we adopted DevOps principles, meaning all developers are now taking part in the design, development, deployment and operations of our cloud infrastructure. This allows us to iterate fast, but then, the security team must move fast too.

Unless we shift most of the security concerns as far left as possible? Right in the hands of our developers? This post will give you a few ideas. Spoiler, tooling is the key!

<!-- more -->

## The challenge of knowledge

With DevOps principles came Infrastructure as Code. There are multiple IaC tools out there, but we decided to use Terraform. Terraform can manage almost every AWS resources. This means we can create IAM roles, EC2 instances, S3 buckets and hundreds of other resources using Terraform.

While this is all great, it does not remove the need to understand how those AWS services are working. Like my paragliding instructor told me, knowledge is what keeps us safe! Without the knowledge of what is safe and what isn't, we are in danger.

It's exactly the same then we think about cloud services and infrastructure as code. To create a secured environment, we need to:
- Understand the service we are trying to use
- Know how to configure that service
- Know how to use Terraform to automate that configuration

It does not stop top configuring a resource for a specific cloud service. We now have Kubernetes too! In Kubernetes, we can create a Deployment fronted by an Ingress that configures an AWS Application Load Balancer. So we need to know how to write a secure Deployment manifest and a secure Ingress manifest while understanding how Kubernetes will configure that ALB, because we need to make sure it was well configured!

## A traditional approach

When does security kicks in? When do we realise we made mistakes in that Terraform code? AWS has multiple services that can help identify misconfigurations:
- [AWS Trusted Advisor](https://docs.aws.amazon.com/whitepapers/latest/aws-overview-security-processes/aws-trusted-advisor-security-checks.html)
- [AWS Config conformance packs](https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html)
- [AWS IAM Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html)
- [AWS Security Hub](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards.html)
- ...

If you don't have anything yet, AWS Security Hub is your best bet as it fetches findings from multiple AWS services into one interface and helps you prioritize.

So, what happens when we configure AWS Security Hub after delegating infrastructure management to all our teams? Well, if everyone took the time to read all the documentation available each time they needed to create a new piece of infrastructure, everything will be green!

The problem is that we all know it's not how it was built. We most likely:
- Copied a piece of Terraform code from StackOverflow
- Copied another piece of Terraform code from our colleague that copied from StackOverflow
- Used our IDE to tell us the required parameters without reading any documentation
- Used a pre-built Terraform module from someone else without looking at the code too much
- ...

We are now facing dozens, hundreds, of AWS resources that don't follow best practices or that don't follow your corporate policies. How do we fix that?

AWS Config offers us the possibility to create [remediation actions](https://docs.aws.amazon.com/config/latest/developerguide/remediation.html). While the idea is great, having a tool that changes our resources configuration can bring multiple problems:
- It can break your application
  - Enabling KMS encryption on a non-encrypted resource without adapting your application IAM role will definitely break things
  - Some resources cannot be changed, they need to be deleted then re-created
- It creates a configuration drift since the Terraform code does not contain the fix

We need to fix the Terraform code, which will fix resources. So in which Git repository is the code that created that resource again?

## The DevSecOps approach

DevSecOps tells us we need to automate security tests and run them as soon as possible in the development cycle. We are already familiar with static code analysis tools for our applications source code, so why not do the same with our Terraform code?


## How to run Checkov on every Terragrunt plan

