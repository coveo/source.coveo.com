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

Trying to find a good introduction for this blog post, I did what I do when I need to write a complex piece of code: a Google search! I searched for DevSecOps. One of the first results was [this article](https://www.redhat.com/en/topics/devops/what-is-devsecops) on the RedHat website.

Basically, Coveo adopted the DevOps principle, meaning that all developers are now taking part in the design, development, deployment and operations of our cloud infrastructure. This allows us to iterate fast, but this also means that the security teams must move fast as well.

To build secure environments while adopting DevOps, we must shift security left, putting it as much as possible in the hands of our developers. Shifting security left is a hot topic in the software industry right now. This post will give you a few ideas. Spoiler: tooling is the key!

<!-- more -->

## The challenge of knowledge

Infrastructure as a service (IaaS) opened a new world of possibilities. IaaS providers like Amazon Web Services (AWS), Microsoft Azure, and Google Cloud are now all well known and don't need any presentation. Back in 2012, Coveo opened its first AWS account. In 2021, Coveo is now managing over a dozen AWS accounts.

The multiplication of AWS accounts brought the necessity for Infrastructure as Code (IaC). There are multiple IaC tools out there, and Coveo decided to adopt Terraform. Terraform can manage almost every AWS resource. This means a developer can create IAM roles, EC2 instances, S3 buckets, and hundreds of other resources using Terraform.

While this is all great, it does not remove the need to understand how those AWS services are working. To quote my paragliding instructor: "Knowledge is what keeps us safe!". Without the knowledge of what is safe and what isn't, a pilot is in danger.

It's exactly the same when configuring cloud services using Infrastructure as Code. To create a secured environment, it is necessary to:
- Understand the AWS services, their features, their limitations
- Know how to configure these services
- Know how to use Terraform to automate that configuration

It does not stop at configuring an AWS resource for a specific cloud service. Developers now have to use Kubernetes too! In Kubernetes, a developer can create a Deployment fronted by an Ingress that configures an AWS Application Load Balancer (ALB). So it is necessary to know how to write a secure Deployment manifest, and a secure Ingress manifest in addition to understanding how Kubernetes will configure that ALB. All of that must be well configured!

## A traditional approach

When does security kick in? When does it become apparent that mistakes were made in that Terraform code? AWS has multiple services that can help identify misconfigurations, such as:
- [AWS Trusted Advisor](https://docs.aws.amazon.com/whitepapers/latest/aws-overview-security-processes/aws-trusted-advisor-security-checks.html)
- [AWS Config conformance packs](https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html)
- [AWS IAM Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html)
- [AWS Security Hub](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards.html)

If you're starting with a fresh organization, AWS Security Hub is a good place to go as it pulls findings from multiple AWS services into one interface and helps security specialists prioritize.

What happens when a security specialist configures AWS Security Hub after delegating infrastructure management to multiple DevOps teams? Well, if everyone took the time to read all the documentation available each time they needed to create a new piece of infrastructure, everything should be green!

We all know we don’t always take the time to fully read the documentation. DevOps team members are likely to:
- Copy a piece of Terraform code from StackOverflow
- Copy another piece of Terraform code from a colleague that copied it from StackOverflow
- Use an IDE to tell what the required parameters are without reading any documentation
- Use a pre-built Terraform module from someone else without looking at the code too much
- Etc.

With time, an organization might end up with dozens of AWS resources that don't follow best practices or that don't follow corporate policies. How can that be fixed?

AWS Config offers us the possibility to create [remediation actions](https://docs.aws.amazon.com/config/latest/developerguide/remediation.html). While the idea is great, having a tool that changes AWS resource configurations can bring multiple problems:
- It can break the application (some resources cannot be changed, they need to be deleted and then re-created)
- It creates a configuration drift since the Terraform code does not contain the fix

The Terraform code itself must be fixed. Fixing the Terraform code will fix resources. In which repository is the code managing that resource again?

## The DevSecOps approach

Since organizations now ship changes to production environments multiple times per day, requesting a manual code review from a security expert for all changes would not scale. I could spend all my days reviewing Terraform code and Kubernetes manifest files changes, and I don't think I could cover them all.

DevSecOps tells security specialists they need to automate security tests and run them as soon as possible in the development cycle. Organizations are already familiar with static code analysis tools for their application source code, so why not do the same with Terraform code?

This is where a tool like [Checkov](https://www.checkov.io/) kicks in. Installing Checkov is easy:
```shell
pip install checkov
```

Using it is even easier:
```shell
checkov -d /path/to/terraform/files
```

Checkov is one tool, but there are multiple tools out there:
- [Terrascan](https://www.accurics.com/products/terrascan/) is another open-source tool, which leverages Open Policy Agent policies
- [Snyk Infrastructure as Code](https://snyk.io/product/infrastructure-as-code-security/) is free for open-source projects and for a limited number of private projects
- [Bridgecrew](https://bridgecrew.io/) are creators of Checkov, and they offer a SaaS that performs analyses on IaC and much more
- Etc.

In this blog post, Checkov was chosen because it is free, simple, well documented, and easy to extend.

## What Checkov can do for us

Creating an S3 bucket using Terraform is quite easy:
```hcl
resource "aws_s3_bucket" "data" {}
```
This is all developers need! They don't even have to specify a name for the S3 Bucket; Terraform will generate one automatically...

So what happens if Checkov performs an analysis on that code?

```shell
(checkov) jplachance@host checkov-with-terragrunt % checkov -f modules/app/bucket.tf 

       _               _              
   ___| |__   ___  ___| | _______   __
  / __| '_ \ / _ \/ __| |/ / _ \ \ / /
 | (__| | | |  __/ (__|   < (_) \ V / 
  \___|_| |_|\___|\___|_|\_\___/ \_/  
                                      
By bridgecrew.io | version: 1.0.781 

terraform scan results:

Passed checks: 4, Failed checks: 4, Skipped checks: 0

Check: CKV_AWS_20: "S3 Bucket has an ACL defined which allows public READ access."
        PASSED for resource: aws_s3_bucket.data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/s3_1-acl-read-permissions-everyone

Check: CKV_AWS_70: "Ensure S3 bucket does not allow an action with any Principal"
        PASSED for resource: aws_s3_bucket.data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/bc_aws_s3_23

Check: CKV_AWS_57: "S3 Bucket has an ACL defined which allows public WRITE access."
        PASSED for resource: aws_s3_bucket.data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/s3_2-acl-write-permissions-everyone

Check: CKV_AWS_93: "Ensure S3 bucket policy does not lockout all but root user. (Prevent lockouts needing root account fixes)"
        PASSED for resource: aws_s3_bucket.data
        File: /bucket.tf:1-0

Check: CKV_AWS_19: "Ensure all data stored in the S3 bucket is securely encrypted at rest"
        FAILED for resource: aws_s3_bucket.data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/s3_14-data-encrypted-at-rest

Check: CKV_AWS_18: "Ensure the S3 bucket has access logging enabled"
        FAILED for resource: aws_s3_bucket.data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/s3_13-enable-logging

Check: CKV_AWS_52: "Ensure S3 bucket has MFA delete enabled"
        FAILED for resource: aws_s3_bucket.data
        File: /bucket.tf:1-0

Check: CKV_AWS_21: "Ensure all data stored in the S3 bucket have versioning enabled"
        FAILED for resource: aws_s3_bucket.data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/s3_16-enable-versioning
```

There is a lot of information here:
- There are things Terraform is doing right!
- There are things Terraform is doing wrong...
    - Ensure all data stored in the S3 bucket is securely encrypted at rest -> Default encryption on S3 objects is not enabled
    - Ensure the S3 bucket has access logging enabled -> The [S3 server access logging feature](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ServerLogs.html) is not configured
    - Ensure S3 bucket has MFA delete enabled -> The [MFA delete S3 feature](https://docs.aws.amazon.com/AmazonS3/latest/userguide/MultiFactorAuthenticationDelete.html) is not enabled
    - Ensure all data stored in the S3 bucket have versioning enabled -> Versioning for our objects is not enabled

These problems are all easy to fix, when the developer knows they are problems! This is the beauty of Checkov. It gives us links to documentation that explains to us what's missing. Knowledge is the key!

Based on those recommendations, here is a valid S3 bucket Terraform code:
```hcl
data "aws_s3_bucket" "logging" {
  bucket = "logging-bucket"
}

resource "aws_s3_bucket" "data" {
  # checkov:skip=CKV_AWS_52: Terraform cannot enable MFA delete, it can only be enabled by the Root account

  bucket = "my-data-bucket"

  logging {
    target_bucket = data.aws_s3_bucket.logging.id
  }

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}
```

## How to run Checkov on every Terragrunt plan

Now that the organization picked a tool, DevOps teams need to adopt it. Once again, automation is the key. Checkov can run in a Jenkins job, in a GitHub action, or Terragrunt could run it automatically on each `plan`.

[Terragrunt](https://terragrunt.gruntwork.io/) is a nice wrapper that can be used on top of Terraform. It brings multiple features, and one of them is the [before_hook](https://terragrunt.gruntwork.io/docs/features/before-and-after-hooks/#before-and-after-hooks). It is possible to instruct Terragrunt to run a custom command before the actual Terraform `plan` command.

```hcl
terraform {
  before_hook "checkov" {
    commands = ["plan"]
    execute = [
      "checkov",
      "-d",
      ".",
      "--quiet",
      "--framework",
      "terraform",
    ]
  }
}
```

With these few lines of HCL code, Terragrunt will run the `checkov` command every time a developer runs a `terragrunt plan` on a project. If Checkov identifies insecure code, it exits with the `1` exit code, which fails the `before_hook`, which in turn stops the `terragrunt plan`.

There are a few benefits to this approach:
- Developers most likely already use the `terragrunt plan` command before submitting a pull request
- Since the CI/CD pipeline probably already does a `terragrunt plan`, there's no need to change a single line of code in the CI/CD pipeline configuration

Integrating security tools inside other DevOps tools is a great way to drive adoption.

## Next steps

Running static analysis on Terraform files and on Kubernetes manifest won't solve all problems, but it will help the security team adapt to the speed of DevOps and shift a bit of security responsibilities left, i.e., in the hands of developers. Developing knowledge about AWS, Kubernetes, and all the other things your organization might be using is also essential.

The organization still needs observability in the resulting environment. AWS Config is there to help, and so are other SaaS providers like Lacework!

If you want to learn more about DevSecOps at Coveo and about the tools our developers are building, like [TGF](https://github.com/coveooss/tgf) and our own version of [Terragrunt](https://github.com/coveooss/terragrunt), let us know!
