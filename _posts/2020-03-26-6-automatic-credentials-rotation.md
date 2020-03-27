---
layout: post

title: "8 things that are good to know before using AWS Secrets Manager"

tags: [AWS, cloud, Secrets Manager]

author:
  name: Jean-Michel Provencher
  bio: Software Engineer
  twitter: jimprovencher
  image: jmprovencher.png
---

One of the big challenges tech companies face today is credentials management. Let’s face it, every company should rotate periodically all their secrets to make sure they respect industry standards regarding security and compliance. However, this task can easily become overwhelming as we have to rotate them manually. With the shift to cloud-first microservices, the amount of secrets we have to manage exploded. Each service needs to authenticate with others. Those secrets all need to be rotated.
<!-- more -->

To solve this problem, there are multiple approaches. A well known one is [Vault by HashiCorp](https://www.vaultproject.io/). Vault is not a managed service though and we felt like we should use managed service as much as possible to help us scale.

## "Don’t think it’s magical"

The previous quote was stolen from one of Coveo’s security analyst. The first mistake one could make when diving head first into Secrets Manager is to think that everything is managed by AWS and that implementing the secret rotation is going to be easy and straightforward. It’s not.
 
Automatic rotation will require one Lambda function per type of secret that you will need to manage, test, deploy and monitor. Yes, you can use Lambda functions built and deployed by AWS, but they might not fit your business and developers needs. You better prepare architecture documents and share it with the different development teams before coming up with a final design. On our end, our architectural design included a Python project built with the [tox](https://tox.readthedocs.io/en/latest/) automation project and deployed using our in-house deployment pipeline.  
 
Furthermore, we added some exception monitoring with [Sentry](https://sentry.io/) and recorded audit and rotation logs in [Kibana](https://www.elastic.co/kibana). Together, these initial design decisions will shorten development time while reducing friction amongst development teams.

## Battle-Test Your Rotation Lambda Functions

Like I mentionned earlier, even if AWS is kind enough to share with the community some [sample functions](https://github.com/aws-samples/aws-secrets-manager-rotation-lambdas), make sure that you rewrite them to actually fit your needs, company policies, and guidelines. The samples provided cover the basic use cases and credential types but, let’s be frank about it, every use case is different. 

At Coveo, we started with our internal OAuth2.0 Client Secrets used between our different services. We first made sure that our systems had the proper APIs and behaviours, then we created a new Lambda function from scratch implementing the AWS Secrets Manager requirements. We rotated them once a day during at least a month in our development environment until we were confident enough in our design to release it in production. This type of secret was a great candidate due to its intensive use by almost every internal development team. Selecting a credential with such heavy use will enable your team to catch unexpected events in your services when a rotation occurs.

## Assume Your Rotation Lambda Functions Will Fail

AWS Secrets Manager uses a distributed computing model called [eventual consistency](https://en.wikipedia.org/wiki/Eventual_consistency). A fancy expression meaning that, due to cache propagation, any changes you make in your secret can take some time before being completely visible across API requests. Since the secret rotation is composed of 4 steps that cascades really fast, the Lambda function will sometimes fail because values are not yet properly propagated. Don’t worry, AWS included an automatic retry strategy directly in Secrets Manager that should automatically replay your Lambda function at the necessary step until the propagation is completed.

## Be Backward-Compatible

![Multi-User Database Rotation Architecture]({{ site.baseurl }}/images/2020-03-26-automatic-credentials-rotation/multi-user-architecture.png)

At Coveo, we have teams deploying services in Python, C++, C#, Golang, Java and I can go on. It was unthinkable to force individual teams to change the way their services will read secrets in the foreseeable future. 

To tackle this problem, we decided to update the existing secrets in [AWS Systems Manager Parameter Store](https://aws.amazon.com/systems-manager/features/#Parameter_Store) during the final step of a rotation. This way, teams would have the opportunity to keep the way they read secrets until they would be ready to completely switch to Secrets Manager. 

In addition, every type of credentials we rotate always has two sets of valid credentials, hence preventing any credentials change to cause downtime in our services. For example, we created two service accounts per microservice in our databases. We put in place a simple rule: never rotate the credentials if they are still in use. The first step of our rotation function validates there are no active connections for the user we want to rotate. If there are, we abort the rotation immediately.


## Additional Gotchas

### Deletion Retention Period

Secrets in Secrets Manager have a deletion retention period. This customizable period allows you to restore a secret in the case of an unfortunate error that would have led to the deletion of a secret. However, this period can cause trouble with infrastructure as code languages such as Terraform and Cloudformation. If you destroy a secret resource and try to recreate it during the deletion period, you may face some mysterious HTTP 400 errors. 

This is the result of bad error handling on the provider side and simply means that a secret cannot be recreated when already scheduled for deletion. Running the following CLI command will fix the problem:
``
aws secrets-manager delete-secret --secret-id my-awesome-secret --force-delete-without-recovery
``

### When is a Rotation Triggered?

As you can read in the [documentation](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_RotationRulesType.html), it is possible to set an interval (days) at which you want your secret to be rotated. Nonetheless, you don’t control the specific time at which the rotation happens. 

Maintenance windows are currently unsupported in Secrets Manager. This means that you must be confident that your services and tools are tolerant to a rotation happening at any given time of the day (or night!).

### KMS Policies

Secrets in Secrets Manager are encrypted using KMS Keys. You may think that granting the `secretsmanager:GetSecretValue` permission would be enough to access the secret value but, it’s not. You must also grant the `kms:decrypt` permission on the chosen KMS key in order to read the secret. One drawback is that your rotation function needs KMS permissions for each KMS key used by your development teams. It is something to keep in mind as it’s a potential threat.

### Monitor your rotation

The first thing we added in our first rotation function was Sentry. It is essential that your development team gets notified when an exception occurs in the Lambda function. Credentials are essential to every service's core functionalities and you don’t want an unexpected behavior in the rotation breaking your application without knowing it. 

By adding Sentry, we quickly discovered that eventual consistency computing model can cause a lot of noise. We had to catch some exceptions and silence them to prevent false negatives.

## Conclusion

AWS Secrets Manager can be a very strong tool to help you achieve credentials management at scale but must be adapted to every company's needs in order to extract the best results out of it. The learning curve is short but steep and you should have an in-depth read of the [documentation](https://docs.aws.amazon.com/secretsmanager/index.html) before starting your work. 

I hope that by sharing the challenges we faced and the things we learned along the way we can help you save a little bit of time while integrating AWS Secrets Manager.