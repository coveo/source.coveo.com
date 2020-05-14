---
layout: post

title: "The Life of a Request"

tags: [workplace,remote,culture]

author:
  name: Marc-Antoine Veilleux
  bio: R&D Director
  twitter: qcMAV
  image: maveilleux.jpg
---

Over the years I’ve been at Coveo, I’ve often had to explain the different technological stacks we use and their associated teams. The best way I’ve found to understand the whole intelligence platform was to follow a recommendation or search request life cycle, so let me take you on that journey.

<!-- more -->

It starts with a simple UI, either as a simple recommendation or a search box rendered in the browser.

Behind these pixels, there are multiple teams working hard to make sure it looks and works great. At the core, we have _Search UI (**TypeScript, React, JavaScript, Golang, Terraform, K8S**)_, a team that is responsible for developing the Coveo UI library that our clients use to integrate Coveo into their systems. They are also developing a WYSIWYG application that allows non-developer customers to customize their UI integration, and most recently, the team is creating a new backend service that will allow customers to host and bootstrap the creation process of the UI.

Then, the following teams help integrate the UI and adapt Coveo inside multiple use cases: _Salesforce Integration (**TypeScript, JavaScript, Salesforce**), Sitecore (**C#, Typescript, React**), Commerce (**Java, Spring Boot, AWS, Terraform, K8s, Docker, Typescript, React, Redux,  SCSS**)_ , and _ServiceNow (**C#, JavaScript**)_. Each team’s goal is to fully integrate Coveo inside their associated use case and make sure it’s convenient and easy to use.

These teams work closely with our _UX (**Sketch, InVision, Adobe Suite, Confluence, Google Drive, LucidCharts**)_ and _Demo (**JavaScript, TypeScript, Python, Go, AWS, Salesforce**)_ teams. The _UX_ team’s goal is to design the user’s journey across all Coveo products based on various user research and design activities, in collaboration with PMs. They monitor and validate the development of new features to ensure simple, usable, and appealing user interfaces. 

The _Demo_ team’s goal is for its members to become Coveo product experts, so that they can design and build the best representations of what we can bring to our customers.

That’s it from the perspective of the client’s browser, but there’s a lot more to the story. When a customer visits a page with a recommendation or a search page, a query is sent to our servers. Coveo is hosted on **AWS**. To maintain those servers, we separate the workload across three teams: _Cloud Infra, Cloud Ops,_ and _Platform Foundation_. 

The _Cloud Infra (**Kubernetes, Terraform, Elasticsearch/OpenDistro, Prometheus, Puppet, AWS, Python**)_ team provides and maintains the base infrastructure needed to run Coveo's Cloud services. 

The _Cloud Ops (**Python, Jenkins, AWS, k8s**)_ team manages the Cloud Production environments 24/7 to ensure their best performance and uptime. They also perform rollouts of some workloads, manage Ops requests, and oversee AWS costs. 

The _Platform Foundation (**Java, Spring Boot, Spring Cloud, AWS, Terraform, K8s, Docker**)_ team’s mission is a bit different. They implement and maintain solutions throughout the technology stack for the core functionalities of a world-class SaaS platform such as observability, high availability, fault-tolerance, service discovery, internet gateway, and authentication.

Once the request is received on our infrastructure, it is routed to the _Search API (**Scala, Kinesis, RDS, Redis, Terraform, K8S, Elasticsearch**)_ team. They orchestrate all of Coveo’s micro-services that drive recommendations and searches, which are vital to our clients’ businesses. They also empower our customers’ administrators with a programmable query transformation system (QPL).

From a high-level perspective, the _Search API_ uses indexed content and machine learning models to find the relevant information to answer the request. Behind these concepts, multiple teams are responsible for surfacing this information efficiently.

From an index perspective, there are three main teams: _Index, Index Infrastructure,_ and _Indexing Pipeline._

The _Index (**C++, Python, Java, Elasticsearch, AWS**)_ team is responsible for the core index/search technology used at Coveo. This team also manages the Java Index and Field services.

The _Index Infrastructure (**C++, Python, Docker, Kubernetes, Terraform, CMake, Jenkins**)_ team implements, deploys, and monitors solutions to improve and scale our customers’ indexing capabilities.

The _Indexing Pipeline (**C++, Python, Java, Docker, Kubernetes, Terraform**)_ team is responsible for the backend pipeline that processes every document to make them ingestible by the Index Service. This includes carrying the documents from one step to the next and transforming them (conversion, indexing pipeline extensions, etc.). This team is also responsible for the Java Extension Service.

Overall, these teams' purpose is to surface a search query on some content, and to do it as quickly as possible. To move the data from our customers’ repositories to our index, we will need the help of multiple other teams: _Connectors (**C#, .Net, .Net Core, Terraform, MySQL**) , Salesforce Connectivity (**C#, Scala**) , Connectors Infrastructure (**Java, .Net Core, Terraform**), Security Cache (**C++, Java, Python**),_ and _Sources (**Java, Spring, Terraform, AWS, elasticsearch, k8s, docker**)_.

The _Connectors_ team designs, implements, maintains, and deploys Connectors which allow our clients to configure and crawl various content sources to retrieve data, metadata, and permissions.

The _Salesforce Connectivity_ team develops and maintains our solution that crawls all the needed data, schema, metadata, and permissions from the Salesforce Platform. Half a billion items are crawled each week.

The _Connectors Infrastructure_ team designs, implements, deploys, and monitors solutions to improve and scale the infrastructure supporting Coveo’s secure content crawling capabilities.

The _Security Cache_ team develops and maintains the modules used to enforce a secured search, i.e., to quickly and accurately determine which users can see which pieces of information when a query is performed.

The _Sources_ team develops and maintains APIs that allow clients to customize the content they wish to index, as well as APIs that allow them to push their content to our infrastructure.

We’ve covered a request coming from the UI, going into our infrastructure, and getting routed by the Search API to the index which matches some content. What about all of the personalization and machine learning? Well, the Search API also calls our machine learning microservices and merges everything together. Thus, like the index, we need a way to create these machine learning models. This is the job of multiple _Machine Learning (**Scala, Spark, Python, PyTorch, TensorFlow, Scikit-learn, EMR, Kinesis, DynamoDB, Lambda**)_ teams, the _Machine Learning Backend (**Java, AWS, K8S, Spring, Terraform**)_ team, and the _Usage Analytics (**Java, Kinesis, Snowflake, Redshift, Terraform, Tableau, DynamoDB, MySQL**)_ team.

We have multiple _Machine Learning _teams that are developing machine learning algorithms and NLP models to learn from users' interactions and documents' contents to produce advanced functionalities such as automated relevance tuning, query suggestions, recommendations, semantic search, question answering, automatic categorisation, and more.

The _Machine Learning Backend_ team has developed a platform to build and serve machine learning models and keep them performing at a high level, even while their usage is doubling every year.

The _Usage Analytics_ team collects signals about user interaction points with Coveo products and provides our customers with the ability to monitor and understand what is going on with their application so that we can help them optimize it. This information is also used by the machine learning algorithms.

So ultimately, with the content from the index and our machine learning models, we are able to answer the initial request! Hooray!

There are some other important teams at Coveo that are omnipresent, even if they aren’t part of the query path. Here are some examples: 

The _Administration Console (**JavaScript, TypeScript, React/Vapor, Redux, Nightwatch, Jest, CSS/SASS, Jenkins, HTML5**)_ team provides customers with an administration console that allows them to configure, tune, and monitor their Coveo application using a single point of service.

The _Dev Tooling (**Python, Go, Terraform, Jenkins**)_ team develops deployment tools to improve the day-to-day efficiency of our other development teams. They facilitate development in a DevOps mindset.

We also have several specialist teams whose role is to support all of the other teams:

The _QA_ team validates all changes prior to their deployment and assures the general quality of all production features.

The _Documentation (**Markdown, Jekyll, Ruby, JavaScript, Python, TypeScript**)_ team delivers accurate, complete, concise, easy to use, and well-written documentation to help Coveo customers, partners, and employees understand and leverage our products.

And our 3 security teams: 

_Security - Compliance & Effectiveness - Red (**Python, Veracode, Snyk**)_ automates compliance validation and auditing, educates the development teams about best compliance practices, and executes penetration testing.

_Security - Defense & Systems - Blue (**Python, Kubernetes, Terraform, Elasticsearch, Prometheus, Java / Scala, C#, AWS, Docker**)_ builds and deploys security applications and automates manual processes from cloud privileges to the Software Development Lifecycle. They defend against attackers and work constantly to improve our security posture.

_Security - Governance & Risks - Green_ is a governance-driven team. They evaluate security and privacy risks, manage relationships with providers and customers' security teams, and maintain internal information Security Programs and Policies.

Finally, the _Solution Architect team (**Coveo, Sitecore, Salesforce, ServiceNow, Google Tag Manager, JavaScript, Python, LucidCharts**)_ is a business-oriented team which empowers integrators through a deep knowledge of the product and years of field experience. Their clients are both external (customers, end users, and partners) and internal (sales, success, support, and training).

That’s it! It takes all of these teams working together to make software like ours here at Coveo. I hope that all this information  helps you understand all of the work that goes into something as simple as some recommendations or a search box. 

If you are interested in joining Coveo R&D and helping us solve these challenges together, you can check out [jobs.coveo.com](http://jobs.coveo.com/).



