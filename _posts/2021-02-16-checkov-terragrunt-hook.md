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

With DevOps principles came Infrastructure as Code (IaC). There are multiple IaC tools out there, but we decided to use Terraform. Terraform can manage almost every AWS resources. This means we can create IAM roles, EC2 instances, S3 buckets and hundreds of other resources using Terraform.

While this is all great, it does not remove the need to understand how those AWS services are working. Like my paragliding instructor told me, knowledge is what keeps us safe! Without the knowledge of what is safe and what isn't, we are in danger.

It's exactly the same when we think about cloud services and Infrastructure as Code. To create a secured environment, we need to:
- Understand the service we are trying to use
- Know how to configure that service
- Know how to use Terraform to automate that configuration

It does not stop at configuring an AWS resource for a specific cloud service. We now have Kubernetes too! In Kubernetes, we can create a Deployment fronted by an Ingress that configures an AWS Application Load Balancer (ALB). So we need to know how to write a secure Deployment manifest, and a secure Ingress manifest while understanding how Kubernetes will configure that ALB, because we need to make sure it will be well configured!

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
- Copied another piece of Terraform code from our colleague that copied it from StackOverflow
- Used our IDE to tell us the required parameters without reading any documentation
- Used a pre-built Terraform module from someone else without looking at the code too much
- ...

Now, we might be facing dozens, hundreds, of AWS resources that don't follow best practices or that don't follow your corporate policies. How do we fix that?

AWS Config offers us the possibility to create [remediation actions](https://docs.aws.amazon.com/config/latest/developerguide/remediation.html). While the idea is great, having a tool that changes our resources configuration can bring multiple problems:
- It can break your application
    - Some resources cannot be changed, they need to be deleted then re-created
- It creates a configuration drift since the Terraform code does not contain the fix

We need to fix the Terraform code, which will fix resources. So in which Git repository is the code that created that resource again?

## The DevSecOps approach

Since we now ship changes to production environments multiple times per day, requesting a manual code review from a security expert for all changes does not scale. I could spend all my days reviewing Terraform code and Kubernetes manifest files changes, and I don't think I could cover them all.

DevSecOps tells us we need to automate security tests and run them as soon as possible in the development cycle. We are already familiar with static code analysis tools for our applications source code, so why not do the same with our Terraform code?

This is where a tool like [Checkov](https://www.checkov.io/) kicks in. Installing Checkov is easy:
```shell
pip install checkov
```

Using it is even easier:
```shell
checkov -d /path/to/terraform/files
```

Checkov is one tool, but there are multiple tools out there:
- [Terrascan](https://www.accurics.com/products/terrascan/) is another open-source tool, leverages Open Policy Agent policies
- [Snyk Infrastructure as Code](https://snyk.io/product/infrastructure-as-code-security/) is free for open-source projects and for a limited number of private projects
- [Bridgecrew](https://bridgecrew.io/) are creators of Checkov, and they offer a SaaS for your IaC
- ...

In this blog post, Checkov was chosen because it is free, simple, well documented, easy to extend.

## What Checkov can do for us

Creating an S3 bucket using Terraform is quite easy:
```hcl
resource "aws_s3_bucket" "sensitive_data" {}
```
This is all we need! We don't even have to specify a name for our Bucket, Terraform will generate one for us...

So what happens if we ask Checkov his opinion?

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
        PASSED for resource: aws_s3_bucket.sensitive_data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/s3_1-acl-read-permissions-everyone

Check: CKV_AWS_70: "Ensure S3 bucket does not allow an action with any Principal"
        PASSED for resource: aws_s3_bucket.sensitive_data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/bc_aws_s3_23

Check: CKV_AWS_57: "S3 Bucket has an ACL defined which allows public WRITE access."
        PASSED for resource: aws_s3_bucket.sensitive_data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/s3_2-acl-write-permissions-everyone

Check: CKV_AWS_93: "Ensure S3 bucket policy does not lockout all but root user. (Prevent lockouts needing root account fixes)"
        PASSED for resource: aws_s3_bucket.sensitive_data
        File: /bucket.tf:1-0

Check: CKV_AWS_19: "Ensure all data stored in the S3 bucket is securely encrypted at rest"
        FAILED for resource: aws_s3_bucket.sensitive_data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/s3_14-data-encrypted-at-rest

Check: CKV_AWS_18: "Ensure the S3 bucket has access logging enabled"
        FAILED for resource: aws_s3_bucket.sensitive_data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/s3_13-enable-logging

Check: CKV_AWS_52: "Ensure S3 bucket has MFA delete enabled"
        FAILED for resource: aws_s3_bucket.sensitive_data
        File: /bucket.tf:1-0

Check: CKV_AWS_21: "Ensure all data stored in the S3 bucket have versioning enabled"
        FAILED for resource: aws_s3_bucket.sensitive_data
        File: /bucket.tf:1-0
        Guide: https://docs.bridgecrew.io/docs/s3_16-enable-versioning
```

There is a lot of information here:
- There are things we are doing right!
- There are things we are doing wrong...
    - Ensure all data stored in the S3 bucket is securely encrypted at rest -> We forgot to configure default encryption on S3 objects
    - Ensure the S3 bucket has access logging enabled -> We forgot to configure our audit trail
    - Ensure S3 bucket has MFA delete enabled -> We did not use the [MFA delete S3 feature](https://docs.aws.amazon.com/AmazonS3/latest/userguide/MultiFactorAuthenticationDelete.html)
    - Ensure all data stored in the S3 bucket have versioning enabled -> We did not enable versioning for our objects

These are all easy to fix problems, when you know they are problems! This is the beauty of Checkov. It gives us links to a documentation that explains to us what we missed. Knowledge is the key!

Based on those recommendations, here is a valid S3 bucket Terraform code:
```hcl
data "aws_s3_bucket" "logging" {
  bucket = "logging-bucket"
}

resource "aws_s3_bucket" "data" {
  # checkov:skip=CKV_AWS_52: We cannot enable MFA delete, can only be done by the Root account

  bucket = "my-data-bucket"

  logging {
    target_bucket = data.aws_s3_bucket.logging.id
    target_prefix = "${var.env}-S3ServerAccessLogs/my-data-bucket"
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

Now that we have a tool, we need developers to adopt it. Once again, automation is the key. We could run Checkov in Jenkins, in a GitHub action, or we could use Terragrunt to run it for us.

[Terragrunt](https://terragrunt.gruntwork.io/) is a nice wrapper we can use on top of Terraform. It brings multiple features, and one of them is the [before_hook](https://terragrunt.gruntwork.io/docs/features/before-and-after-hooks/#before-and-after-hooks). We can instruct Terragrunt to run a custom command before the actual Terraform `plan` command.

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

With these few lines of HCL code, Terragrunt will run the `checkov` command every time we run `terragrunt plan` on our project. If Checkov identifies insecure code, it exits with the `1` exit code, which fails the `before_hook`, which stops the `terragrunt plan`.

There are a few benefits from this approach:
- Developers most likely already use the `terragrunt plan` command before submitting a pull request
- Since you probably already do a `terragrunt plan` in your CI/CD pipeline, you won't need to change a single line of code in your CI/CD pipeline configuration

## Next steps

Running static analysis on your Terraform files and on your Kubernetes manifest won't solve all your problems, but it will help you adapt to the speed of DevOps and shift a bit of security responsibilities right in the hands of developers. Developing knowledge about AWS, Kubernetes, all the other things you might be using is essential.

Then, we still need observability on the resulting environment. AWS Config is there to help, so are other SaaS providers like Lacework!

If you want to learn more about DevSecOps at Coveo and about the tools we are building, like [TGF](https://github.com/coveooss/tgf) and our own version of [Terragrunt](https://github.com/coveooss/terragrunt), let us know!
