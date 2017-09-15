---
layout: post

title: "Deploy Kubernetes in Production Automatically with Kops, Jenkins, and Terraform"

tags:
  - kubernetes
  - aws
  - docker
  - kops
  - jenkins
  - terraform

author:
  name: Pierre-Alexandre
  bio: Team lead - Cloud infrastructure
  twitter: pastjean
  imageURL: https://avatars.githubusercontent.com/u/140675
---

Kubernetes: one hip word we see everywhere  in the Cloud developer and Devops world. With reasons: Kubernetes does solve problems (and creates others) and simplify a lot of things. In this post we'll explore how we deployed k8s to production automatically with help from Terraform, Jenkins, and Kops.

At Coveo, we decided that Kubernetes was the tool of choice to run our docker containers in production. This is replacing a "homemade" setup with AWS Opsworks and dockers. It will save money and resources, and enable faster deployments.

<!-- more -->

So how did we do it?

# Deploy with Kops Automatically

[kops](https://github.com/kubernetes/kops) is the kubernetes "official" tool to deploy a cluster to AWS.

We created an initial cluster config using those settings and then ajusted the config to match our needs, especially the VPC config and subnets creations since we create them elsewhere.

```sh
kops create cluster k8s.coveodemo.com \
   --state=s3://yourbucket/develop/kops/testpastjean \
   --zones=us-east-1a,us-east-1b,us-east-1c \
   --master-zones=us-east-1a,us-east-1b,us-east-1c \
   --networking=calico \
   --kubernetes-version=1.6.2 \
   --master-count=3 \
   --dns=private \
   --master-size=m3.medium \
   --node-size=m4.xlarge \
   --cloud-labels="coveo:billing=infra__mt__kubernetes,coveo:environment=Development" \
   --cloud=aws \
   --topology=public \
   --vpc=vpc-xxxxxxxxx \
   --network-cidr=10.10.0.0/16 \
   --associate-public-ip=false \
   --authorization=RBAC
```

We then pulled that config from the s3 bucket and versioned it, excluding the secrets obviously, so when we want to change the cluster configuration, a single commit is needed.

The deployment is handled by a Jenkins job and [Terraform](https://www.terraform.io). It is done like so:

```sh
aws s3 sync kops/${params.cluster} '${params.kopsStateStore}${params.cluster}'

kops update cluster \
	${params.cluster} \
	--target=terraform \
	--out=terraform/kops

rm -rf terraform_toapply
terraform init -backend -backend-config="${params.tfBackend}" terraform terraform_toapply
cd terraform_toapply
terraform plan -lock-timeout=20m -input=false
```

You probably see in there that we generate the terraform files in a subdirectory. This is because Kops creates the Kubernetes Terraform config, but we also add things over it. The generated Terraform configuration is included as a Terraform [module](https://www.terraform.io/docs/configuration/modules.html)

The directory tree looks like this:

```
-kops/ # the kops cluster configuration
|- <clustername>/ # the kops cluster configuration
|- ...
-terraform/
|-kops/ #kops generated files
|-k8s_aws_elb_tagger/ # containing the terraforms files needed to deploy the elb tagger
|-route53_kubernetes/ # containing the terraform files needed to deploy route53-kubernetes
|-kubernetes_state.tf # the file binding all that together
|-dev-backend.tf # The terraform s3 backend configuration for the development environment
|-prod-backend.tf  # The terraform s3 backend configuration for the production environment
```

The `kubernetes_state.tf` ties all modules together

```
terraform {
  backend "s3" {}
}

provider "aws" {
  region = "us-east-1"
}

module "kops" {
  source = "./kops"
}

module "k8s_aws_elb_tagger" {
  source = "./k8s_aws_elb_tagger"

  cluster_name = "${module.kops.cluster_name}"
  k8s_nodes_role_arn = "${module.kops.nodes_role_arn}"
}

output "cluster_name" {
  value = "${module.kops.cluster_name}"
}

// ... other outputs so we can reuse in external application modules
```

## Automatic rollout

If it is not a pull request, we rollout the Terraform changes and then do a rolling update of your nodes automagically ✨💫✨.

```sh
terraform apply -lock-timeout=20m  -input=false

kops rolling-update cluster ${params.cluster} --yes \
		--fail-on-validate-error="false" \
		--master-interval=8m \
		--node-interval=8m
```

Simple enough.

That's all, we now have an autodeployed Kubernetes cluster with versionned configuration and terraform s3 backed state so everyone can reuse the kubernetes configuration for their needs.
