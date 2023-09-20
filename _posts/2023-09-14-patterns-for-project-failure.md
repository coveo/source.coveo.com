---
layout: post

title: "Patterns for project failure"
tags: [Software engineering]

author:
  name: Nicolas Juneau
  bio: Software Developer
  image: njuneau-coveo.jpg
---

## Introduction

My name is Nicolas Juneau and I am Coveo’s _CFO_ (Chief Failure Officer). As the blog review team
has yet to unpack a huge backlog of articles to review, I took this opportunity to write on this
blog about a subject nobody wants me to talk about: patterns for project failure.

We all heard the conferences, we all read the articles: we know how to ensure a project’s success.
After all, software engineering is a tried and true discipline as old as civil engineering. Julius
Caesar successfully designed, wrote, and deployed
[his very own cipher](https://en.wikipedia.org/wiki/Caesar_cipher) back in the Roman empire, so we
should have this figured out by now. Today, let’s take a break from articles teaching us what to do
and let’s focus on something more entertaining: striving for failure.

> Let me do what we always try to do on Star Trek: hopefully entertain you, perhaps even make you
> laugh a couple of times. And when your guard is down, slip in a heavy idea or two...
> 
> -- <cite>Gene Rodenberry, “Inside Star Trek”, 1979</cite>

<!-- more -->

For the purpose of this article, we will develop a fictional project that involves the following
disciplines:

* UX
* Frontend development
* Backend development
* Infrastructure
* Security

For each discipline, failure patterns will be described. Nobody should feel shame if they recognize
such patterns in their own experience. It only means that you are human working in a human
organization.

## The project

As a Coveo employee, a colleague came to you with the following project opportunity:

To build and deploy a social network tailor-made for Pug lovers. Not the toy, but arguably the most
lovable dog. For brevity’s sake, sales and marketing already came up with the name: _PikPug_.

The details of the project are intentionally left vague.

## Step 1: Business case (non)-analysis

_PugBook_ is bound to be a surefire hit: market research shows Pug lovers are all over the place and
advertising opportunities are ripe.

One might be tempted to run with the idea immediately, and this would be one of the first steps into
a failing project: ignoring the company’s core business and values.

Multiple issues are at hand here:

* Your colleagues, who joined Coveo to work in the complex field of machine learning will likely not
  be too delighted with the opportunity to expand their knowledge to the world of Pugs and social
  media. As unbelievable as it may sound, not everybody loves Pugs.
* Such a venture will likely appear dubious to many parties inside and outside the company. As a
  customer, I might wonder why effort is spent on such an endeavor (no matter how lovely it is)
  instead of spending effort into the solutions I’m paying for right now. As a director, I would
  likely have a fun time trying to justify this investment with regards to current company
  objectives.
* Should the project be greenlit anyway, it could compromise current efforts and objectives. Unlike
  popular belief, human resources are not like printer cartridges (interchangeable and replaceable
  at any given time). Why the industry still labels human beings as resources is a subject best left
  for another blog post.

Besides all the aforementioned red flags, you take matters into your own hands and go ahead with the
project. I can tell you right now that the probability of this actually happening for real at Coveo
is near 0 - but, there is a theory that says that in a parallel universe, it happened.

## Step 2: You landed at _Agility_! Go directly to step 3!

Project manager must be the most ungrateful position to hold as these super-humans must constantly
try to keep a fine balance between reckless speeding and analysis paralysis. One workaround that can
be employed with almost guaranteed failure in the long term is to use agility as a means to identify
issues in planning while simultaneously using agility as an excuse not to address them. This usually
translates to:

* An absent roadmap
* An absent budget forecast
* An unclear team commitment (how many, for how long)

Perceived benefits include:

* Short planning sessions (read: _absent_)
* Lean budget planning (read: _absent_)
* Supple objectives (read: _everchanging_)

The overarching mentality is essentially that you don’t need to bother with what happens in the next
weeks or months unless you’re planning to go to the moon.

_Protip_: When questioned about the utility of planning ahead, deal in the extremes. Examples such
as “We’re not building a space shuttle” or “Do you know how much they spent on [insert NASA mission
of your choosing]?” will ensure a swift rebuttal, supported by your good understanding of what NASA
missions entails. Creating the fear that a project might cost as much as a space shuttle in terms of
planning is the perfect way to avoid doing any planning to begin with.

## Step 3: Segregate UX and software development

Now that planning has been tackled, let's talk about UX. One commonly applied pattern is to keep a
safe distance (no less than 1KM open space, 500 meters closed space) between UX and developers.
Perceived benefits being:

* Design meetings involving both UX and developers will never take place, saving some precious time
  on the drawing board (it costs less to apply changes to the user experience once coding starts)
  while simultaneously freeing developers to implement the solution.
* Feedback loops are perfectly airtight and concise (UX and developers can’t benefit from each
  other’s experience).
  
The central theme of the pattern being that UX is a separate process from software development, much
like security is (more on that later).

## Step 4: Skip software engineering

One applied failure pattern is that software engineering practices are useless in the face of
all-star coders spinning up <abbr title="Proof of concept">POC</abbr>s faster than the time it takes
to put together a <abbr title="Potatoes (fried), brown sauce and jalapeño cheddar">PB&J</abbr>. Why
bother spending time thinking about what you’re about to code and not code it already? After all,
the reasons are aplenty:

* Defining software requirements, especially with frameworks such as
  [FURPS+](https://web.archive.org/web/20201112020231/http://www.ibm.com/developerworks/rational/library/4706.html#N100A7)
  or worse, [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) is unnecessary. All people
  think alike and share the same perspective about the
  project. Having a standard on how to communicate requirements is just another burden.
* Time spent drafting software processes, especially with well-known languages such as
  [UML](https://www.uml.org/) or [BPMN](https://www.bpmn.org/), is time not spent coding. Besides,
  UX does not have access to those artifacts and just like UX,
  the most cost-effective time to tackle core issues is while the code is being built.
* Keeping an Architecture Decision Record (ADR) is time-consuming. The context in which the
  decisions are made never changes and will never invalidate your decisions in the future. You’ll
  save a lot of time revisiting decisions you should not question ever anyway. If you’re onboarding
  new employees that have a hard time getting up to speed as a result, it’s their fault they weren’t
  there when the decisions were made.

In short: get to code (i.e., _real_ value) as fast as you can.

## Step 5: Always invent it here

Many are aware of the [NIH syndrome](https://en.wikipedia.org/wiki/Not_invented_here) - and for good
reason. As software developers, resisting the temptation to invent it ourselves is like resisting
the ever-present chants of the dark side. The temptations come in many forms:

* Your terms, all the time: no time wasted on checking software licenses, background-checking the
  companies behind them.
* Your code, the way you like it: no time wasted on conforming to other software communities’
  contribution guidelines. You are the guidelines.
* Your own release cycle: are other people moving too fast? Or maybe too slow? You do your own
  thing, at your own pace.
* No need to invest in security scanners: your internal libraries will always be more secure. No
  3rd parties, no vulnerabilities!

Although not quite in the realm of “Not Invented Here”, a closely related phenomenon is forking. The
neat thing about open source software is that you can make it your own. Key benefits include:

* Internal forking: no need to spend time trying to get your fix upstream, just ship it internally.
* Reduced license costs: Community support ended and you don’t pay for commercial support? Keep the
  patches coming yourself!

## Step 6: Automate infrastructure work later

Many tools exist to automate infrastructure work: [Terraform](https://www.terraform.io/),
[Cloudformation](https://docs.aws.amazon.com/cloudformation/), or
[Ansible](https://www.ansible.com/) to name a few. However, deploying those tools efficiently
requires a lot of effort. If you don’t have time to automate your infrastructure now, you won’t have
time later either. Just like UX, implementing infrastructure automation late in the game costs much
less than doing it in advance. After all, what’s not to love about pages of AWS Web console
screenshots, <abbr title="Bourne-again shell">Bash</abbr> scripts and good old elbow grease?

## Step 7: There are no 9s after 100%

You made it from steps 1 to 6 and your product has been deployed in production. People are using
your product and the future looks bright. However, you want to ensure that _PugBuddies_ remains
eternally so: functioning all the time, in tip-top shape.

This is where one sneaky failure pattern rears its head: being unable to fail. You want your product
to be perfect, and you know you can make it:

* Simple <abbr title="Service-level objective">SLOs</abbr>: , always on, all the time. Pug love is
  eternal and cannot fail. [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem) be damned, your
  software will scale,
  distribute, and remain perfectly consistent forever.
* Everybody on call, 24/7, at the same time. Don’t overthink the on-call schedules - your software
  is well built. If your people keep getting paged, it’s because your piece of software is broken,
  not because your alarms are defective or unreasonable.
* If it’s not green, it’s catastrophic. Incident management becomes incredibly easy: either the
  whole system is in perfect health, or it’s completely dying.  Resolving alarms takes less time
  than figuring out why they occur and why they are important to you.
  [Focus is applied on the causes](https://cloud.google.com/blog/topics/developers-practitioners/why-focus-symptoms-not-causes). Bonus points: no need to think about
  [error budgets](https://www.atlassian.com/incident-management/kpis/error-budget) anymore.

## Step 8: Security?

If there is some time left, security measures may be put in place on the off chance that they’re not
already there. Security is a lot like UX: it’s best done separately, fixed most efficiently once in
production. <del>Your well-spent budget allows for the following security considerations to be
put in place...</del> Scratch that, you're out of time and budget. Assume security is good.


## Epilogue

By now _PugVogue_ should be up in production, with a team happily maintaining it day to day in a
healthy manner. It will stand as a shining beacon of innovation inside your organization, a
testament to your everlasting creativity. Please excuse me, my pager is buzzing!

## Conclusion

I would hope everybody recognizes themselves in one way or another while going through this article.
Whether it is your past self you are seeing, the self you wish to improve, or a self you wish not to
become, you now have all the tools in hand to fail in a consistent manner. You might be tempted to
ask, is Coveo then impervious to project failure? The answer is no. And that’s part of what makes a
good defense against it: we recognize failure as a possibility, not a fatality. We know that to err
is human, and how to learn from our errors. We don’t know perfection, but our collective experience
most certainly knows disaster - and our talented staff will do everything in their power to make
your projects with us a success.
