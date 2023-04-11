---
layout: post

title: "Temporary privileges as a service, a nice engineering challenge"

tags: [Security,Identity,Access,AWS,Serverless,strongDM]

author:
  name: Jean-Philippe Lachance
  bio: Staff Software Developer, Team Lead, R&D Security Defense
  twitter: JeePLachance
  image: jplachance.jpg
---

I spend most of my days inside a code editor, Jira, Outlook, or in meetings. Now that one of our projects won the [Identity Management Project of the Year – SMB](https://www.idsalliance.org/press-release/identity-defined-security-alliance-announces-winners-of-identity-management-awards/), it's a great opportunity to take a look back at what the Coveo R&D Defense team built.

The Coveo infrastructure is constantly growing. DevOps engineers add new regions, new services, which leads to more systems that can break, more complex access management and more complex audit logging. If I tell stakeholders that the entire R&D department needs always-on access to all the services they deploy and own in a production environment, some of those stakeholders will tell me that the risks are too high, that it is not acceptable. On the other hand, if only a handful of people can help when there is an incident in production, if someone needs to wake up the on-call access management person at 3 in the morning because they need access to a specific role in a specific database in our Australian region, the time to resolution of incidents goes up, our service level agreement gets breached, leadership does not like that.

This is why Coveo needed a good middle ground. The R&D department needed a system that allows selected employees to gain privileged access on systems they own for a short period of time, fix the incident, follow up with a post-mortem. Back in 2020, Coveo adopted [strongDM](https://www.strongdm.com/) to manage privileged access rights. While it already supported granting temporary privileges, it lacked a way to allow employees to quickly request a temporary privilege, without waking up the strongDM administrator at 3 AM. From the strongDM APIs, the R&D Defense team built that system.

<!-- more -->


## Tracking requirements

What does a Coveo employee needs before being allowed to request a temporary privilege to a system the employee owns? Well, many things. The first step is to complete the Coveo onboarding process. This process will make sure the employee read the Coveo policies, went through trainings, cleared the background check, etc. Coveo has what HR calls the Coveo 90. The employee manager is responsible for going through the entire process with the new employee.

So what's the link with temporary privileges? Well, the access management system must not grant a privilege to an employee that did not meet all these requirements yet. How does Coveo define the requirements? In an access matrix. Ok, what? Well, Coveo R&D employees are invited to contribute to a centralized YAML file that defines:

- Teams
- Access levels in a team
- The targeted environment
- Requirements for that access level in that team in that environment
- Available temporary privileges for members of that team / access level when requirements are met

Here is a small example of what it can look like:

```YAML
teams:
  - team_name: platform
    access_levels_per_env:
      - access_level_name: non_production
        environment: dev
        access_rights:
          - system: STRONGDM
            sub_system: servers
            privileges:
              - type:ssh,tag:env=dev
      - access_level_name: prod_administrator
        environment: prod
        requirements:
          background_check: true
          supervisor_approval: true
          trainings:
            - hipaa-training
            - policy-acknowledgement
        access_rights:
          - system: STRONGDM
            sub_system: databases
            privileges:
              - 'prod-platform-readonly'
              - 'prod-quartz-readwrite'
          - system: STRONGDM
            sub_system: servers
            privileges:
              - type:ssh,tag:env=prd,tag:team=platform
          - system: STRONGDM
            sub_system: clusters
            privileges:
              - prod-platform-activity-service-maintenance
          - system: IAM
            privileges:
              - user-group-prod-temp-platform-admin
```

Some environments have `requirements`, some don't. For example, the development environment is one where Coveo does not enforce strict requirements, to allow quick frictionless innovation. The production environment though is a lot more restricted.

```YAML
requirements:
  background_check: true
  supervisor_approval: true
  trainings:
    - hipaa-training
    - policy-acknowledgement
```

In this specific example, the access matrix defines that a background check be completed, that the employee's supervisor endorsement is required, that some specific trainings in our Learning Management System must be completed.

## Learning Management System (LMS) integration

Of course, the access management system then needs to be fully integrated with a few system, like the LMS. Coveo invested a lot in learning management by creating [level up](https://levelup.coveo.com/), a home-made LMS, tailor-made for our needs. On level up, Coveo has internal and external trainings. Anyone can learn how to use the Coveo Platform through level up. On top of that, employees can learn about internal policies and procedures as well.

With this building block, each employee has a clear path on level up. After completing a training, the access management system picks it up, then the employee can automatically start to see more resources in the resources catalog. More on that later!

## Power to the managers

One of the main requirements is the manager approval. Traditionally, a manager opens a request to an IT team to request someone from IT to add their new hire in a given group. The other option is that an IT person checks the new hire colleague groups, and applies a copy-paste logic. In both cases, there are either inefficiencies or over provisioning of privileges.

This is why, on top of our temporary privileges solution, the R&D Defense team built a small API and frontend application to allow a manager to grant up to their own privileges to a new hire, once all the requirements for that specific team and level are met.

![]({{ site.baseurl }}/images/2023-04-11-temporary-privileges/uam_privileges_edit.png)

A Coveo manager:

- Can see the employee' progression in the LMS
- Can select the employee access group and access level, up to their own privileges
- Is accountable for granting those privileges

With this other building block, the R&D Defense team removed the IT back and forth by automating as much as possible. They gave visibility and accountability to managers. The team also built a similar interface for employees, so they can clearly see their progress, their current privileges. Thanks to React and reusable components!

## Personalised resources catalog

Now that Coveo has an access matrix, clear requirements, an LMS integration and autonomous managers, the system needs to stitch it all together in order to show our employees a catalog of resources they can request temporary access to. Here, the secret is to tag everything, apply strict tag policies, move toward Attributes Based Access Control ([ABAC](https://en.wikipedia.org/wiki/Attribute-based_access_control)).

For those of you who spent time on the first YAML block of this post, you noticed that Coveo uses rules to define the list of resources an employee can request:

```YAML
- system: STRONGDM
  sub_system: servers
  privileges:
    - type:ssh,tag:env=prod,tag:team=platform
```

Inside our AWS accounts, the Coveo R&D has [tag policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_tag-policies.html) that tell our engineers to set some specific tags with a given set of allowed values. When code registers an instance or a database inside strongDM, the code gives strongDM those tags, which then allows us to filter resources in strongDM based on those tags. From there, R&D engineers that want to contribute to the access matrix can write rules like "a `platform` team engineer with the `production_administrator` access level can request an `ssh` access to instances of the `prod` environment where the instance `team` tag value matches `platform`, if all the requirements are met".

This is how Coveo ends up with a catalog of available (requestable) resources, personalised for each employee, based on where they are in their Coveo journey, what their manager allows.

![]({{ site.baseurl }}/images/2023-04-11-temporary-privileges/uam_temp_access_catalog.png)

In this UI, the employee can select the problematic resource, chose an expiration date for the temporary access (within a given range), input a reason for the request. After the request is validated against the matrix and other systems, the access management system grants the access using the strongDM API. The employee can fix the issue, the employee doesn't have to wait for a long approbation process or page another colleague or manager.

## Tech stack

Behind this UI lives an AWS Lambda function, AWS API Gateway, authentication, authorization, accountability. Each call to the API leaves a complete audit trail. For example:

- Changes made by managers
- Requests made by employees
- Privileges granted to employees
- Etc.

The interface is built using React and [Coveo Plasma](https://plasma.coveo.com/), our library of React components built on top of [Mantine](https://mantine.dev/).

The access matrix is stored in GitHub. Any change to the access matrix goes through a pull request, and a code review, and approval by managers and asset owners. The beauty of having this matrix in the YAML format in GitHub is that any employee, or manager, or asset owner can contribute to it, and suggest changes, and improve the life of Coveo employees. Once approved, changes are synced into AWS S3, and the Lambda function picks it up, and the available resources catalog is updated. This is a classic [GitOps](https://about.gitlab.com/topics/gitops/) example.

## The post-mortem

Some peers in the security space will say that allowing an engineer to get that access with such low friction is unsafe. I see the point, but the layers of multi-factor authentications, VPNs, all the logging made by our API, all the logging made by strongDM, combined with all I described above allows me to sleep well at night.

When the temporary privilege is granted, if the privilege is for a sensitive resource (AKA not a development one), the request creates an Incident in Jira, in a board our compliance team can review. The next morning, the compliance team can review:

- The request reason
- Linked issues
- Sessions [recordings in strongDM](https://www.strongdm.com/solution/cloud-observability-and-visibility) (since strongDM records all SSH sessions, database sessions, Kubernetes interactive sessions, etc.)
- The engineer's next steps

The true thing to remember here is that if security teams don't give engineers the tools they need, engineers will find a way to bypass controls in place, or the service level agreement will get a hit. Instead, security teams and engineers all have to work as a team, find the best solution possible, focus on what really matters: How can engineers avoid needing this privilege ever again?

With our system, DevOps teams can offer great services to Coveo customers, circle back on what needs improvement when something breaks.

## Next steps

What Coveo is working toward is [Zero Standing Privileges](https://www.strongdm.com/blog/zero-standing-privileges). Our goal is to drop all privileges to all sensitive resources, for everyone, while allowing engineers to quickly get the required privileges if shit ever hits the fan. 💥

Reaching Zero Standing Privileges is ambitious. It will force us to rely a lot more on our access management system. Redundancy will be the key! If something can fail, make sure to have a plan B. In case you wonder, yes, the R&D Defense team is hiring! [Join the Coveo team](https://www.coveo.com/en/company/careers) and work with other folks as passionate as you are!

Special thanks to [Schuyler Brown](https://www.linkedin.com/in/brownschuyler/) who saw our project as an award-winning one and submitted our candidature. This project would not have been possible without the help of the strongDM team and their product. Thank you!!!
