---
layout: post

title: "Keeping 400+ Repositories up-to-date with Renovate"

tags: [GitHub, Renovate, Dependabot, Dependency Updates, Security, Automerge]

author:
  name: Boris Bera
  bio: Senior II Software Developer, Platform Engineering
  image: bbera.jpg
---

At Coveo, we have a lot of repositories. They each have their own dependencies that span across multiple programming languages and package managers. Keeping all of those dependencies up-to-date can be quite a challenge. In this post, we'll go over how we use Renovate to streamline and automate dependency updates.

<!-- more -->

Renovate is a bot that automatically creates pull requests for dependency updates. For most repositories at Coveo, Renovate will open pull requests once a week. In some cases, Renovate can even automatically merge those pull requests on its own when the pull request checks all pass. In other cases, developers need to review and merge those pull requests themselves. We've streamlined this process for developers to the point where they don't need to think about setup or configuration. Renovate is pre-configured to behave correctly and to fit within the workflow of most teams. It just works.

Before discussing how we've achieved this, let's talk about why we keep dependencies up-to-date. We believe that updating your dependencies often is important and comes with some great benefits. Dependency updates include new features, bug fixes, and security fixes. Getting those early and often is a good thing. Also, updating regularly leads to smaller and easier updates. When you're forced to update because of a bug or security issue, the process will go much smoother if your dependencies are already mostly up-to-date. Streamlining Renovate encourages and makes it easy for teams to keep their dependencies up-to-date.

Our current Renovate setup is successful for a few reasons. At a high level, it's because:

- We host a centralized managed Renovate instance for all developers.
- Renovate comes with a standardized configuration that makes sense for Coveo.
- We have extensive documentation that lets developers make sense of what Renovate is doing.
- There's a golden path for repositories to automate Renovate through automerge.
- Security updates get fast-tracked so they get merged as soon as possible.

It's worth noting that we've been using Renovate for quite a while. Things haven't been as streamlined as they are today. I'll be focusing on the current state of Renovate and I'll drop in a few select pieces of history to highlight important steps in our evolution. Our history with Renovate is a long and colorful one which is best told around a campfire. We'll focus on the important stuff here.

## Centralized Renovate

We host a centralized instance of Renovate for all our developers to use. It's fully managed by us. This is great for developers because they don't need to worry about setting up and running Renovate themselves. Back in the day, everyone ran Renovate in slightly different ways. We got rid of this overhead for developers and can now guarantee that Renovate is always up-to-date, well integrated, and fully featured.

Our Renovate instance can be best described as a bunch of Kubernetes CronJobs in a trench coat. We wrote a wrapper program that does some setup and then in turn runs the Renovate CLI. This lets us spread the work that Renovate does over multiple CronJobs. First, we split execution by GitHub organization. Renovate needs a different token for each one. This is a limitation of how Renovate does authentication and how private GitHub apps work. Second, we split execution so that it can be done in parallel. A single Renovate process trying to process all our repositories (~500 as of writing this) takes longer than the time between two CronJob executions. We also stagger the CronJobs to spread the load on our various internal systems. This avoids a big burst of requests and avoids scaling up the cluster. The end result is that Renovate will visit any given repository twice per hour. The staggering means that we don't know the exact time when that happens.

We want to make it as easy as possible for developers to adopt Renovate in their workflow. We leverage Renovate's onboarding pull requests feature for this. When Renovate sees a repository that doesn't have a Renovate configuration, it automatically creates a pull request with a default configuration file. In practice, this means that when developers start a new repository, they'll automatically see a new pull request suggesting that they start using Renovate. They can start using Renovate by simply merging that pull request.

Before we had this centralized Renovate instance, people were running Renovate in all kinds of unique ways. We had to migrate their repositories. We put a few things in place to make this migration process as smooth as possible. First, we implemented a blocklist in the centralized instance. This allowed us to run both the new instance and the old ad hoc versions of Renovate concurrently. Second, we configured our centralized instance to recognize commits and pull requests from the old ad hoc instances. When Renovate sees commits from any users other than itself on a pull request it will stop updating the pull request to avoid erasing somebody's changes. We configured our centralized instance to ignore commits from all other instances. This allowed it to seamlessly take over pull requests created by old ad hoc instances.

With that in place, all we needed was to migrate. Some teams did the migration on their own as they wanted to benefit from the new centralized instance right away. For the rest, we inventoried all repositories that were using old ad hoc instances of Renovate and got to work. The process was straightforward: turn off the old instance and remove the repository from the blocklist. After a lot of pull requests and cleaning up, everyone was using the new centralized instance.

Today, developers simply use our centralized Renovate instance. It's all transparent and requires no setup on their part. It just works.

## Configuration

We provide developers a standardized and centralized Renovate configuration that simply does the right thing. This means that in most cases, developers can start using Renovate in their repositories without having to figure out how to configure Renovate. They can trust that it'll behave correctly out of the box. This also means that Renovate behaves the same way across all our repositories. This helps us troubleshoot issues and makes it easier for people to contribute to any repository.

We use two mechanisms to configure Renovate: presets and global configuration. Presets are shared bits of configuration that users can import in their own Renovate configuration files. Global configuration is done by passing options to the Renovate CLI directly when running it. Most of our shared configuration is done through presets. We only use global configuration when we are forced to. Our standard configuration does quite a lot. Here's an overview of some of the key settings:

- Put dependencies into logical groups. Renovate will update all dependencies that are in the same group in a single pull request. This reduces noise and the number of pull requests teams have to review.
- Configure access to our internal package registries. This allows Renovate to update internal dependencies.
- Schedule Renovate to create its pull requests early in the morning on Tuesdays. This avoids constantly spamming teams with pull requests. We chose Tuesday over Monday because people will sometimes have Mondays off due to holidays and long weekends.
- Enable version updates for internal tools. We have a few internal tools that hold version number in their configuration files. This tells Renovate how to update those version numbers.
- Ignore dependency updates that are less than a few weeks old. This ensures we're not too cutting-edge and gives dependencies time to stabilize before we update.
- Disable certain updates for dependencies that require internal migrations. This is for stuff like major versions of frameworks whose version should be synced across all services.

Teams are also able to customize their Renovate configuration to fit their workflow. They can do this by directly changing their Renovate configuration files or by writing their own presets. We have a centralized repository with all our Renovate presets. We encourage teams to contribute presets in there as part of the standard preset, an optional preset, or a team preset. Keeping all presets in one place allows us to share and apply best practices at large instead of siloing them off.

Like I mentioned in the section above, we use Renovate's onboarding pull request feature to ensure that every repository that starts using Renovate starts off with our recommended configuration. These onboarding pull requests add a small Renovate configuration that simply imports our standard presets. This keeps the repository configurations as small as possible and avoids mass pull requests when we need to change the configuration for everyone.

Before we centralized our configuration, Renovate configurations were very diverse and spread out. There was a lot of copy-pasting and some teams maintained their own set of shared presets. We had to study everyone's configurations and migrate them to use our standard preset. We did this migration at the same time as we migrated people off their ad hoc Renovate instances to our centralized Renovate instance. This saved time for us and for all our developers. We wrote some tooling to help us automate the migration as much as possible. For most repositories the migration was trivial. Some teams had configurations adapted for their workflow. We gave those teams their own team preset that included those settings so that they could easily import them in all their repositories. We were able to simplify a lot of Renovate configurations by removing redundant settings and we were able to fix a lot of bad practices and troublesome patterns.

After all our projects were migrated to the centralized configuration, we learned an important lesson that's worth sharing here. Our centralized configuration effectively became a single point of failure. Any changes to our configuration now have a large blast radius. Incorrect configurations changes can result in Renovate generating a large number of pull requests for our users. This can easily disrupt their workflows and generate busywork for them. To guard against this possibility, we invested in tooling and processes that gave us confidence in the changes we published to the centralized configuration:

- We put in place a process for running Renovate on test repositories with in-development configuration changes.
- We built a mechanism that allows us to publish experimental configurations and test those in the wild before enabling them for everyone.
- We created a Renovate smoke test and validation process that makes sure that our configuration is minimally sound.

Today, our standard configuration is adopted at large with minimal customization. Renovate simply behaves correctly for all our users.

## Documentation

Over all these years of running Renovate and helping our users with a variety of issues, we've learned a very important fact. Renovate is a complicated system. There's a lot of moving parts that can all be configured in many different ways. It's hard for users to reason about Renovate and understand what it's doing and why it's behaving a certain way.

Our centralized Renovate instance and our standardized configuration helped users understand Renovate a little better because there weren't as many different configurations in the wild. Renovate was still hard to reason about by its very nature. Also, our new added defaults, while good, were another layer that users needed to understand to make sense of the system.

To address this, we wrote a fair bit of documentation for our users. This includes stuff like a high level overview of our standard configuration, a getting started guide, a configuration guide, a troubleshooting guide, a contribution guide, and an FAQ. We also generated references for all our presets. The reference pages show a summary of the preset, a simple usage guide, links to presets that are used by the current preset, and finally, the full contents of the preset. This saves users from having to rummage through our code to figure out what a preset does.

As you might expect, we use Coveo internally. We call it Coveo@Coveo. All of this documentation is fed into Coveo@Coveo which lets our developers discover it easily. Also, our [RGA](https://docs.coveo.com/en/n9de0370/leverage-machine-learning/about-relevance-generative-answering-rga) capabilities allow developers to ask questions about Renovate and get immediate answers without having to read the documentation.

Our documentation combined with our centralized Renovate instance and standard configuration have significantly reduced the number of support requests we get around Renovate. Things are running quite smoothly these days.

## Automerge

Getting automatic pull requests from Renovate for dependency updates is great but developers still need to take the time to look at them, review them, and merge them. Wouldn't it be great if these pull requests could merge themselves? That way, we get dependency updates without the busywork. The great news is that Renovate has a feature for that. It's called "automerge".

Automerge comes with some significant risks. A dependency update could introduce a bug or break something in production. It could also be a vector for a [supply chain attack](https://en.wikipedia.org/wiki/Supply_chain_attack), when a malicious actor compromises a dependency to attack a downstream system that uses said dependency. While automerge can cut down on busywork and make us more efficient, we need to go about it carefully. There are two parts to our approach.

The first part of our approach is done through configuration. We force safe settings in Renovate. This ensures that teams can't configure automerge in an unsafe way. Renovate normally waits for all checks in a pull request to become green before it merges. There are a few settings that let users turn off this requirement. We forcibly set good values for those settings globally. Teams can't change those. We also configure sane defaults around automerge in our standard config. This ensures that Renovate behaves safely out of the box while allowing teams to customize the behavior. Here's a summary of our safe automerge configuration:

- Schedule automerges on Tuesdays, Wednesdays and Thursdays between 9:00am and 12:00pm. This ensures that when Renovate merges a pull request automatically, there's a human around in case something goes wrong.
- Ignore dependency updates that are less than a few weeks old. This gives the broader open source and security communities time to catch supply chain attacks and other issues. It also gives our security tools time to report on such attacks.
- Disable automerge on major updates for language runtimes. These are often disruptive and require manual tweaks.

These settings are not bulletproof but they're guardrails that reduce the odds and impact of potential issues.

The second part of our approach is done through governance. We put in place a strict set of requirements for using Renovate's automerge feature. These requirements include:

- Have a CI pipeline with good tests that can catch issues.
- Run security and compliance checks in CI to catch issues with dependencies.
- Use our standard configuration.
- Have solid monitoring and alerting in place.
- Use a progressive deployment strategy with automated rollbacks.

When developers want to activate automerge on one of their repositories, they reach out to our SRE team who validates that they meet these requirements. If they do, the repository is added to the list of repositories that are allowed to use Renovate's automerge feature.

We enforce this logic in our Renovate wrapper program. When a repository is not allowed to use the automerge feature, that feature is forcibly disabled. This means that teams can't bypass the requirements process.

We provide users with a base automerge configuration. This configuration enables automerge on all Renovate pull requests except for the few cases mentioned above. This might seem pretty wild at first, but we think that if a project is mature enough to pass our requirements then it should be safe to automerge any dependency updates. The CI and deployment processes act as guardrails and safety nets. Teams can customize this. They're the ones who know their dependencies the best so they can determine which dependencies might need human attention. We want to encourage them to automate away the Renovate busywork as much as possible if they can.

We didn't always take this approach. In our first attempt, we allowed anyone to use automerge but we built a configuration that only enabled automerge for "trusted" dependencies. We quickly realized that this was not going to work. Turns out that it's really hard to determine if a third party project should be "trusted" or not. How likely are they to ship a bug or vulnerability? How likely are they to fall victim to a supply chain attack? We couldn't answer those questions. That's why we changed our approach to the one we have today where we focus on the maturity levels of our projects.

Today, ~120 repositories are allowed to use Renovate automerge.

## Security Updates

Security updates are like any other dependency updates except that they come with a few quirks.

Unlike normal dependency updates, security updates should be applied quickly. They often can't wait for the regular Renovate pull request schedule. Luckily for us, this is handled well by default. Renovate uses GitHub's security alerts feature to determine if a dependency has a vulnerability. If it's able to update it, it'll create a pull request while ignoring the schedule and other settings that might force it to wait. On top of this, it'll try to perform the smallest update possible. This means that we get the pull request right away and that it will likely be easy to merge because it doesn't include additional bug fixes or features that might get in the way. This is Renovate's default behavior.

This works well for direct dependencies (the packages your project explicitly depends on) but falls short with transitive dependencies (the dependencies of your dependencies). Renovate primarily works on direct dependencies. This means that if there's a vulnerability in a transitive dependency Renovate won't try to update it. This is limitation of Renovate and a side effect of how it works internally.

To deal with this limitation, we make use of Dependabot. That's GitHub's dependency update bot. Unlike Renovate, it can operate on transitive dependencies. Dependabot has two modes of operation. It can be configured to update all dependencies or it can be configured only for security updates. We chose the latter option. We believe that Renovate is a better option for general dependency updates since it is more flexible and supports more package managers and programming languages. We only use Dependabot for security updates.

When there's a security update available, developers might see a pull request from Renovate, Dependabot, or both. This is a bit of a quirky user experience but it still works well for us. After all, when it comes to security updates, what matters most is that they get merged quickly.

*If you're passionate about software engineering, and you would like to work with other developers who are passionate about their work, make sure to check out our [careers](https://www.coveo.com/en/company/careers/open-positions?utm_source=tech-blog&utm_medium=blog-post&utm_campaign=organic#t=career-search&numberOfResults=9) page and apply to join the team!*
