---
layout: post
title: Push API Basics (in Java)
tags:
  - Java
  - Push API
author:
  name: Chad Johnson
  bio: Platform Evangelist
  image: cjohnson.jpg
published: true
---

Hello!  I am excited to be writing my first post for the Coveo Technology blog. Before I dive into the Push API, I thought I would very briefly share my background and an explanation of the Coveo Platform Evangelist role.  

Prior to joining Coveo, I was a professional services consultant for 16 years, specializing in application integration, content management and enterprise search. Content management and enterprise search were like chocolate and peanut butter. <!-- more -->

I would help corporations convert paper-based processes into shiny new digital workflows that could easily generate hundreds of thousands of new documents per month.  Without a way to search and locate documents quickly, these systems would be useless. While most content management systems included a built-in search engine, they were often underpowered and incapable of combining content from multiple repositories, especially from different vendors.  

The application integration experience was my secret weapon; by using third-party search engines and developing connectors into each application, we could provide a universal search experience across entire systems.  

Over the years, I built these types of digital workflow systems for law firms, distribution companies, airlines, manufacturers, retailers and more.  The one thing they all had in common was the critical need to search for content.  

And that brings me to my role at Coveo.  As the Platform Evangelist, I will act as a bridge between the software company and our customers, helping them discover, design and implement Coveo Cloud solutions for searching their enterprise systems.

So what should I write about first?  There are many potential Step 1's to empower our customers and partners to build these types of solutions.  I am probably biased by my past experience, but the mechanism for indexing custom content sources seems like a good place to start.  And with Coveo Cloud being, as the name suggests, a cloud-based search engine, it might not be immediately obviously how to accomplish this securely and efficiently.

## A Space Elevator for Your Content (i.e. Push API)

Indexing a large, on-premise content management system with a cloud-based search engine might be perplexing at first.  Do you push the content to the cloud?  Or does the cloud connect to your network and pull the content?  

With Coveo Cloud, the answer is that you push your content up to the cloud with the Push API.  Whether you need to index one document or a million, you simply upload the files and the metadata to Coveo Cloud for processing.  Unless you want to convert and extract the content from files yourself (which I do not recommend), you should upload the original binary files to Coveo Cloud.  The indexing pipeline will convert the files, process them for indexing, and create previews for fast viewing online.  Note: all documents are encrypted during transmission and at rest.

The uploading process is very straight-forward.  Full documentation is available [here](https://developers.coveo.com/display/CloudPlatform/Push+API+Usage+Overview), but I will briefly describe the process:

1. Create a Push Source in your Organization
 * Note the organization id, source id, and API Key - you will need them to execute the remaining steps
2. If you are only uploading metadata, small amounts of text or very small files, skip to step 5
3. Use the API to request a URL for uploading your content
 * You will be given a pre-signed URL for an encrypted AWS S3 bucket and a fileID used to reference it later
4. Upload your file to the pre-signed URL
5. Create a JSON document with all metadata, security information (like ACLs), text-based content, and base64-compressed binary content if you have a very small file
 * If you uploaded a large binary file to S3, add the fileId given to you in step 3 instead
6. Upload the JSON document with the Push API

Your document, including any metadata and binary content will be indexed and searchable within a few seconds, depending on the size and system load.  Documents are considered unique by their documentID (URI).  You can update or delete an existing document by providing the same documentID (URI) again.

### Java Implementation

Using the Push API in Java was fairly simple (and useful when converting some legacy connectors that were written in Java).  The Push API uses standard restful HTTP commands, like PUT, POST and DELETE.  You need to include your API Key as an Authorization header, and the source and organization ids are required in many of the URLs.  

I have created a repository on [GitHub](https://github.com/coveo/pushapi-java) with several examples, and I will add more soon.  I have thoroughly documented the source code and used relatively few third-party libraries, making the code very portable.  Core, reusable operations are defined in the `CoveoPushAPI` class, and examples that string together a series of operations to perform an entire use case are in the various `*Test` classes.

![Code Sample]({{ site.baseurl }}/images/CoveoPushAPI.java.jpg)

### A Few Tips

* Don't forget the API Key and other required headers
* Make note of the various HTTP response codes in the Push API documentation.  Not all of the API calls use the same response codes for success
* Files should be zlib compressed before being uploaded to S3.  I could not find a simple way to do this "stream-to-stream" in Java, so I chose to consume the original input stream into a new, compressed temp file, and then open a stream to the new temp file.  This is safer (memory-wise) than trying to compress to an in-memory byte[].
* Currently, the API gives you a single pre-signed URL for uploading large files to S3.  This precludes the use of the multipart protocol for files larger than 100 MB (which could become an issue when uploading large batches of documents, which I will discuss in a future post).  I am investigating the best way to handle this.  For now, you will have to stream the file to S3 in a single PUT request.
* In metadata, dates must be in UTC.  If you specify a date without a time, it will be interpreted as midnight *UTC*, which is then converted back to the timezone of your organization, which could be the previous day.
* You must provide the file extension, as opposed to the mimetype, of binary files.  This can be a bit odd if your file does not have an extension in your content management system.  I have experimented with using Apache Tiki to get the most appropriate file extension for a given mimetype, and it works well if you find your self in that situation.  I have inquired about the ability to specify a mimetype instead of a file extension.
* Multivalued metadata should be specified as a JSON array, like `[a, b, c]`
