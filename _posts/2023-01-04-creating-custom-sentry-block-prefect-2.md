---
layout: post

title: "Creating a custom Sentry block using Prefect 2"

tags: [data engineering, prefect, sentry, monitoring, slack]

author:
  name: Jean-Michel Provencher
  bio: Staff Software Engineer & Team Lead, Data Platform
  twitter: jimprovencher
  image: jmprovencher.png
 

---


In my last [blog post](https://source.coveo.com/2022/04/20/integrating-sentry-with-prefect-flows/), I described a practical way of integrating Sentry with Prefect 1 flows. Since then, [Prefect 2](https://docs.prefect.io/) was released, and with it, many interesting capabilities were introduced. I won't spend time explaining why you should migrate to Prefect 2, but I suggest you have a look at the new features presented [here](https://docs.prefect.io/migration-guide/). If you're interested, I also created a step by step GitHub [repository](https://github.com/jmprovencher/prefect-tutorial) showcasing some of the new features available so that you can try it yourself.

One of the interesting new concepts being offered is [Blocks](https://docs.prefect.io/ui/blocks/?h=block). Blocks allow users to interface with external systems and configurations across flows. Prefect Cloud comes built-in with a collection of existing block types, but it also offers the possibility to define new one's. With that, it's possible to create reusable utilities that can be shared among flows and teams. This blog post will provide a step by step plan as to how to create a custom Sentry block type that will automatically send notifications to Slack in case of a flow failure.

## What Is Sentry?

Sentry is an error monitoring tool that enables developer teams to be notified rapidly when issues happen in their 
applications. At Coveo, the usage of Sentry is already widespread and most R&D teams are using it in their 
services. 

Even though Prefect comes built-in with automation that allows notifications in Slack in the event of the failure of a flow,
we felt this was not providing us with enough insights regarding what went wrong without having to go through our 
internal logs to investigate. Once our Prefect 2 migration was started, one the first thing we did was create this custom Sentry block type to offer an easy for engineering teams to be notified in the case of a failure in one of their flow.

## Creating a custom block type

The first step for creating a custom block type is to create a class that inherits the Block class from Prefect. After that, it's as simple as defining the logic that you want implemented in different functions that you'll be able to call through your flow. Here's an example for that.

```python
"""Block that initializes Sentry."""
import os
import git

from textwrap import dedent

from prefect import get_run_logger
from prefect.context import get_run_context
from prefect.blocks.core import Block
from sentry_sdk import init, set_context, set_tag
from dotenv import load_dotenv

SENTRY_BLOCK_NAME = "sentry-block"


def _get_git_changeset():
    repo = git.Repo(search_parent_directories=True)
    return repo.head.object.hexsha


class SentryBlock(Block):
    """Block that bootstraps Sentry with metadata related to Prefect flow runs."""

    _code_example = dedent(
        """\
        ```python
        from src.blocks.sentry_block import SentryBlock, SENTRY_BLOCK_NAME

        sentry_block: SentryBlock = SentryBlock.load(SENTRY_BLOCK_NAME)
        sentry_block.initialize_sentry_block()
        ```"""
    )

    def initialize_sentry_block(self):
        """Initialize the sentry block."""
        logger = get_run_logger()
        load_dotenv()

        try:
            logger.info(f"Initializing Sentry...")
            sentry_dsn = os.getenv("SENTRY_DSN")
            environment = os.getenv("ENVIRONMENT")
            region = os.getenv("REGION")

            init(
                sentry_dsn, environment=environment, release=_get_git_changeset()
            )

            set_tag("region", region)

            run_context = get_run_context()

            set_tag("flow_name", run_context.flow.name)
            set_tag("flow_run_name", run_context.flow_run.name)
            set_tag("flow_run_version", run_context.flow_run.flow_version)
            set_context("flow_parameters", run_context.flow_run.parameters)

            logger.info("Sentry was successfully initialized.")

        except Exception as exception:
            logger.error("Failed to initialized Sentry. Inner exception: %s", exception)

```

Let's go through the different things happening in that class. First, we override a member of the class called `_code_example` and provide an example on how to load that block in a Prefect flow. This can be really useful for any developer that might want to use that block in the future, and the code example will be reflected in the Prefect Cloud UI. 

Then, we define a method called `initialize_sentry_block` that will take care of the logic required to make Sentry available in your flow. Please note that this could also have been done in the constructor. This method will retrieve a few different environment variables, initialize Sentry with a designated DSN, and set pertinent tags based on the `run_context` of Prefect. This will make debugging easier by having all of this information available in Sentry.

Now that the custom Sentry block is defined, it's required to create it in Prefect Cloud so that it can be reused in flows. To do that, we can use Prefect Python API.

```python
"""Deployments for Custom Prefect Blocks"""
import logging

from src.blocks.sentry_block import SentryBlock, SENTRY_BLOCK_NAME

logging.getLogger().setLevel(logging.INFO)

base_flow_block = SentryBlock()

base_block_document_id = base_flow_block.save(SENTRY_BLOCK_NAME, overwrite=True)
logging.info(f"Successfully deployed sentry block with document id '{base_block_document_id}'.")

```

Running this script will result in the block creation in Prefect (assuming you are authenticated!).

![block-in-ui]({{ site.baseurl }}/images/2023-01-04-creating-custom-sentry-block-prefect-2/ui-block.png)

As you can see, the code example previously defined in the `SentryBlock` class is available in the UI! How neat is that!

The Sentry block now created in Prefect, we can reuse it in any flow to automatically report on unexpected failures.

```python
"""Sample Prefect2 showcasing Sentry Block capabilities"""
from prefect import flow, task, get_run_logger

from src.blocks.sentry_block import SentryBlock, SENTRY_BLOCK_NAME


@task(name="Failure")
def task_always_failing():
    logger = get_run_logger()
    logger.info("The task will fail soon! 🙈")

    raise Exception("Oh no!")


@flow(timeout_seconds=60)
def sample_flow():
    base_block: SentryBlock = SentryBlock.load(SENTRY_BLOCK_NAME)
    base_block.initialize_sentry_block()
    task_always_failing()


if __name__ == "__main__":
    sample_flow()

```

As we can observe in the code above, any developer can now use these two simples lines and have Sentry initialized its flow.

```python
base_block: SentryBlock = SentryBlock.load(SENTRY_BLOCK_NAME)
base_block.initialize_sentry_block()
```

If we execute that flow that is designed to always fail, we'll receive a notification in Slack as soon as it fails.

![slack-notif]({{ site.baseurl }}/images/2023-01-04-creating-custom-sentry-block-prefect-2/slack-notif.png)

If we click on the link to go investigate the culprit in Sentry, it's possible to observe all the different tags and metadata that were added by the run context to make debugging easier.

![tags]({{ site.baseurl }}/images/2023-01-04-creating-custom-sentry-block-prefect-2/tags.png)

As you can imagine, the possibility are infinite in terms of what you can accomplish with custom block types.


All of the code samples provided in that blog post are available [here](https://github.com/jmprovencher/prefect-sentry-block).

If you're passionate about software engineering and you would like to work with other developers who are passionate
about their work, make sure to check out our [careers](https://www.coveo.com/en/company/careers/open-positions?utm_source=tech-blog&utm_medium=blog-post&utm_campaign=organic#t=career-search&numberOfResults=9) page and apply to join the team!
