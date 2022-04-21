---
layout: post

title: "Integrating Sentry in Prefect Flows"

tags: [data engineering, prefect, sentry, terraform, monitoring, slack]

author:
  name: Jean-Michel Provencher
  bio: Software Engineer & Team Lead, Data Platform
  twitter: jimprovencher
  image: jmprovencher.png
 

---

At Coveo, we deal with an enormous amount of data on a daily basis. With data growth,
our data platform has also grown from a single team a few years back, to more than 3 teams and 20 employees.
With this growth, we also gave ourselves the mission of democratizing data across our organization
and allowing more and more external teams to access and experiment with the data we capture.

The challenge we rapidly faced was that we had to offer more and more support to these external teams on how to
automate some of these applications and scripts they were developing over the data. Most of these stakeholders are
often really proficient with SQL and Python, but have less knowledge and experience with CI/CD,
infrastructure and monitoring.

To solve this problem, we started looking at some solutions that would allow these teams and individuals to easily
deploy and run these different workloads in production, without having to develop an in-house solution that would
require a lot of engineering time and maintenance.

After investigating multiple solutions to solve this problem, a clear winner stood out for us. **Prefect**.

<!-- more -->

## What Is Prefect?

Prefect is a cloud scheduling solution that allows developers to easily run Python scripts without having to worry
about managing the underlying infrastructure. 

>The easiest way to build, run, and monitor data pipelines at scale. [[1]](https://prefect.io)

Prefect offers 3 different alternatives on how you can use their platform. The first one is Prefect Server,
an open source solution that makes you host the whole Prefect UI and scheduler directly in your infrastructure.
It's open-source but you're responsible for everything. 

The second option they offer is Prefect Cloud, which is a fully hosted solution of their platform, allowing you to run
scripts directly in their cloud without having to worry about managing anything. You simply provide a script, and it
will run in their infrastructure.

The third option is what Prefect calls the _[hybrid model](https://www.prefect.io/why-prefect/hybrid-model/)_. 
You basically benefit from all the capabilities available in the Prefect Cloud offering, but the scripts are run in your
infrastructure using a [Prefect Agent](https://docs.prefect.io/orchestration/agents/overview.html). This is the 
solution we opted for at Coveo. It was the best choice to make sure we stayed compliant with our 
security best practices, making sure customer data would never leave our Virtual Private Cloud.

## What Is Sentry?

Sentry is an error monitoring tool that enables developer teams to be notified rapidly when issues happen in their 
applications. At Coveo, the usage of Sentry is already widespread and most R&D teams are using it in their 
services. 

Even though Prefect comes built-in with automation that allows notifications in Slack in the event of the failure of a flow,
we felt this was not providing us with enough insights regarding what went wrong without having to go through our 
internal logs to investigate. Once the initial Prefect implementation was completed on our side, it rapidly became clear
that we needed to implement Sentry in Prefect to make sure that the different teams using it would be alerted if 
anything went wrong in their code.

## Integrating Sentry With Prefect

In this blog post, I’ll show how it's possible to integrate Sentry in a Prefect Flow,
using tools such as [Terraform](https://www.terraform.io/), the [Python Sentry SDK](https://docs.sentry.io/platforms/python/), 
the [Prefect SDK](https://docs.prefect.io/api/latest/), and Slack.

### Infrastructure

First you’re going to need to create some Sentry Terraform resources. If you’re not using Terraform, you can obviously
skip these steps and simply do them manually in Sentry.

To create Sentry Terraform resources, it's important to initialize a Sentry provider. To do that, we internally
have a shared SSM parameter available in AWS that contains a working Sentry token that can be used to retrieve a
Terraform data object to initialize our Sentry provider. If such token isn't available in your current infrastracture,
simply create an SSM parameter and put the Sentry token in it. This provider will allow the creation of Sentry 
resources in the following steps. 

```
data "aws_ssm_parameter" "sentry_token" {
 name = "/${var.env}/sentry_token"
}

provider "sentry" {
 token    = data.aws_ssm_parameter.sentry_token.value
 base_url = "yoursentryurl.com/api/"
}
```

Now that a Sentry provider has been created, we can start creating resources. First, let’s create a project.

```
resource "sentry_project" "prefect" {
 organization = "coveo"
 team         = "analytics"
 name         = "Prefect"
}
```

If you were to perform a `terraform apply` command at this point, you would see a resulting project in Sentry that is
ready to receive incoming events.

![sentryProject]({{ site.baseurl }}/images/2022-04-20-integrating-sentry-with-prefect-flows/sentry_project.png)

At this stage, we need to retrieve the Sentry [DSN](https://docs.sentry.io/product/sentry-basics/dsn-explainer/) key
associated to the project to pass it to our Prefect Flow so that we can initialize it in Python.

```
data "sentry_key" "prefect" {
 organization = sentry_project.prefect.organization
 project      = sentry_project.prefect.id
 name         = "Default"
}

resource "aws_ssm_parameter" "sentry_dsn" {
 name  = "/${var.env}/Prefect/SentryDsn"
 type  = "SecureString"
 value = data.sentry_key.prefect.dsn_secret
}
```

That’s it, we’re pretty much set up for what was needed on the Terraform infrastructure part.

### Creating a Base Task With Sentry Built-in

As more and more teams started adopting Prefect at Coveo, we felt that it is important to provide basic capabilities 
and initializations for these internal developers. We wanted to make sure that their ramp-up and adoption of the tool
was as easy as possible; enabling them to focus on the features they have to implement rather than plumbing around it.

To achieve that, we came up with the idea of creating a base [task](https://docs.prefect.io/core/concepts/tasks.html) 
that would take care of all the common initializations that is required by pretty much every Prefect
[Flow](https://docs.prefect.io/core/concepts/flows.html). One of these common initializations is Sentry.

Creating this kind of task can be achieved simply like this.

```python
from prefect import task

@task(name="Base flow initialization")
def init_base_flow():
   init_sentry()
```

The task decorator is an easy way of creating a task in Prefect. Later on, we’re going to see how we can re-use it in
another flow. For the moment, let’s focus on what the `init_sentry` method does.

```python
import os
import logging
from typing import Any

from sentry_sdk import set_tag, init, set_context
from boto3 import client
from prefect import task, context

SENTRY_DSN_SSM_PARAMETER_NAME = "SENTRY_DSN_SSM_PARAMETER_NAME"
SENTRY_REGION_ENV_NAME = "SENTRY_REGION"
SENTRY_ENVIRONMENT_ENV_NAME = "SENTRY_ENVIRONMENT"
SENTRY_RELEASE_ENV_NAME = "SENTRY_RELEASE"

def init_sentry():
   sentry_dsn_ssm_path = os.environ.get(SENTRY_DSN_SSM_PARAMETER_NAME, None)
   sentry_environment = os.environ.get(SENTRY_ENVIRONMENT_ENV_NAME, None)
   sentry_region = os.environ.get(SENTRY_REGION_ENV_NAME, None)
   sentry_release = os.environ.get(SENTRY_RELEASE_ENV_NAME, None)

   if sentry_dsn_ssm_path is None:
       logging.warning("'%s' environment variable is not defined. Sentry won't be initialized.", SENTRY_DSN_SSM_PARAMETER_NAME)

   if sentry_region is None:
       logging.warning(
           "'%s' environment variable is not defined."
           " Sentry will be missing the region tag when sending events to Slack.",
           SENTRY_REGION_ENV_NAME,
       )

   if sentry_release is None:
       logging.warning(
           "'%s' environment variable is not defined." " Sentry will be missing the release tag when sending events.",
           SENTRY_RELEASE_ENV_NAME,
       )

   if sentry_environment is None:
       logging.warning(
           "'%s' environment variable is not defined."
           " Sentry will be missing the environment tag when sending events to Slack.",
           SENTRY_ENVIRONMENT_ENV_NAME,
       )

   if sentry_dsn_ssm_path:
       try:
           logging.info("Initializing Sentry...")
           sentry_ssm_client = client("ssm")
           sentry_dsn = get_ssm_parameter(sentry_ssm_client, sentry_dsn_ssm_path)
           init(
               sentry_dsn, environment=sentry_environment, release=sentry_release
           )

           if sentry_region:
               set_tag("region", sentry_region)

           set_tag("flow_name", context.flow_name)
           set_tag("flow_run_name", context.flow_run_name)
           set_tag("flow_run_version", context.flow_run_version)

           set_context("flow_parameters", context.parameters)

       except Exception as exception:
           logging.warning("Failed to initialized Sentry. Inner exception: %s", exception)


def get_ssm_parameter(ssm_client, name: str, with_decryption: bool = True) -> Any:
   try:
       response = ssm_client.get_parameter(Name=name, WithDecryption=with_decryption)

       return response["Parameter"]["Value"]
   except Exception as exception:
       raise ValueError(f"Failed to get parameter {name}") from exception

```

The first part of this method actually checks for different environment variables that should be set on this flow run
to properly initialize Sentry with tags. These tags will make it easier to report and understand where the exception is
coming from. By having these different environment variables, it's possible to dynamically set tags such as the region where
the code is running, the environment it’s in, and what is the latest commit id for this code. 

This kind of metadata enrichment will be super useful for developers when they investigate errors in Slack if
anything unexpected happens with their scripts. 

After that, an SSM client needs to be instantiated using Boto3 to retrieve the previously created SSM parameter that contains
the Sentry DSN that is needed to initialize the Sentry SDK. Once the SDK is initialized, adding tags
and context to Sentry using the provided [context](https://docs.prefect.io/api/latest/utilities/context.html) object
from Prefect can be achieved in a simple manner using the `set_tag` and `set_context` methods. Metadata such as the
flow run id and the parameters that were provided to the flow might bring more clarity on why the exception occurred
in the script.

_Voilà_, we now have a base task that will automatically bootstrap Sentry at the beginning of a flow and that can be
easily imported in any flow.

```python
from prefect import Flow, task

@task(name="Divide by zero")
def divide_by_zero():
   return 1 / 0

with Flow("Divide by zero") as flow:
   divide_by_zero(upstream_tasks=[init_base_flow])

flow.run()
```

Running this flow will result in an exception every time, showing up in Sentry with all the provided metadata.
However, if we want to receive alerts directly in Slack when an exception occurs, there is one last thing to set up.

###Integrating With Slack

To make sure any events coming in Sentry will trigger an alert in a Slack channel, a Sentry plugin resource has to be
created in Terraform.

```
resource "sentry_plugin" "prefect" {
 organization = "coveo"
 project      = sentry_project.prefect.id
 plugin       = "slack"

 config = {
   username          = "Sentry"
   channel           = "#analytics-sentry-${var.env}"
   webhook           = “a slack webhook, stored in SSM or elsewhere”
   exclude_project   = false
   include_tags      = true
   included_tag_keys = "region,environment,release"
 }
}
```

After applying this resource with Terraform, when running a Prefect Flow, a notification will be sent in Slack in the
channel that was specified.

![slack_alert]({{ site.baseurl }}/images/2022-04-20-integrating-sentry-with-prefect-flows/slack_alert.png)

In conclusion, this blog post showcased how Prefect can simplify deploying and running data transformations and 
scripts at scale in a way that reduces negative engineering. It also demonstrated how you it's possible to integrate
Sentry with Prefect to obtain better monitoring on running flows in the cloud. 

If you're passionate about software engineering and you would like to work with other developers who are passionate
about their work, make sure to check out our [careers](https://www.coveo.com/en/company/careers) page and apply to join the team!
