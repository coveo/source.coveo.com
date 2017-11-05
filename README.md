# Source @ Coveo
## A technical blog by the fine people at Coveo

See our blog posts at [source.coveo.com](http://source.coveo.com)

Interested in creating a new post? See [How to create a post](https://github.com/Coveo/source.coveo.com/wiki/How-to-create-a-post)

This blog was built using [Jekyll](http://jekyllrb.com/) hosted by [github pages](https://pages.github.com/)


# Create a post

Preparation:

1. You need a Github account, create one [here](https://github.com/join)
2. [Fork this repository](https://github.com/Coveo/source.coveo.com/fork)
3. _(optional)_ Poke us in [#technical_blog](https://coveo.slack.com/messages/technical_blog) or [#opensource](https://coveo.slack.com/messages/opensource) channel on [Slack](http://coveo.slack.com) to join Coveo Organization

Post creation:

1. Create a new markdown file in `_posts` directory.
2. You need a [front-matter](http://jekyllrb.com/docs/frontmatter/)

ex:
```markdown
---
layout: post

title: "Better unit test assertions in Java"

tags: [JavaScript Search Framework, Web Pages Connector, Jekyll]

author:
  name: Guillaume Simard
  bio: Team Lead, UA
  twitter: guisim
  image: guisim.jpg

---
```

3. Write your post using markdown. Follow http://jekyllrb.com/docs/posts/
4. Use the `<!-- more -->` tag within your post. To let Jekyll know where the
  excerpt ends.
5. Commit and push to github.
6. You can view your post at [youruser.github.io/source.coveo.com](youruser.github.io/source.coveo.com)
7. *Create a pull request* and notify us on [#technical_blog](https://coveo.slack.com/messages/technical_blog),
  we will then review, and merge if nothing is to be corrected.
8. Roll yourself over all the traffic you will bring and controversies you will create

# Run locally
1. [Install Docker](https://docs.docker.com/engine/installation/)
2. Clone this repo
3. Run these commands:
```
cd /path/to/your/repo
docker run --volume=$(pwd):/srv/jekyll -p 4000:4000 jekyll/jekyll jekyll server
```
You can then access your local copy of the blog via [localhost:4000](http://localhost:4000/)

Changes made to your local files will be reflected on your blog live.

For more help and info, Jekyll documentation has a nice [installation page](http://jekyllrb.com/docs/installation/)
