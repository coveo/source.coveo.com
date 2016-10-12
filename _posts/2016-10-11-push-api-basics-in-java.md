---
layout: post
title: Push API Basics (in Java)
excerpt: Indexing a large, on-premise content management system with a cloud-based search engine might be perplexing at first.  Do you push the content to the cloud?  Or does the cloud connect to your network and pull the content?  
tags:
  - Java
  - Push API
author:
  name: Chad Johnson
  bio: Coveo Platform Evangelist
  image: cjohnson.jpg
published: true
---

Hello!  I am excited to write my first post for the Coveo Technology blog. Before I dive into the Push API, I would like to briefly introduce myself and my background with enterprise content management systems and search.  The Coveo Cloud Push API is a must-have feature for the types of customers and projects I have encountered.

Prior to joining Coveo, I was a professional services consultant for 16 years, specializing in application integration, content management and enterprise search. In the words of old TV commercials, content management and enterprise search went together like chocolate and peanut butter. <!-- more -->

I would help corporations convert paper-based processes into shiny new digital workflows that could easily generate hundreds of thousands of new documents per month.  If there was't a way to search and locate documents quickly, these systems would be useless. While most content management systems included a built-in search engine, they were often underpowered and incapable of combining content from multiple repositories, especially from different vendors.  

The application integration experience was my secret weapon; by using third-party search engines and developing connectors into each application, we could provide a universal search experience across entire enterprise systems.  

Over the years, I built these types of digital workflow systems for law firms, distribution companies, airlines, manufacturers, hospitals, retailers and more.  The one thing they all had in common was the critical need to search for content.  

And that brings me to my role at Coveo.  As Platform Evangelist, I act as a bridge between the software and our customers, helping them discover, design and implement Coveo Cloud solutions for searching their enterprise systems.

So what should I write about first?  There are many potential Step 1's to empower our customers and partners to build these types of solutions.  I am probably biased by my past experience, but the mechanism for indexing custom content sources seems like a good place to start.  And with Coveo Cloud being, as the name suggests, a cloud-based search engine, it might not be immediately obviously how to accomplish this securely and efficiently.

## A Space Elevator for Your Content (i.e. Push API)

Indexing a large, on-premise content management system with a cloud-based search engine might be perplexing at first.  Do you push the content to the cloud?  Or does the cloud connect to your network and pull the content?  

Coveo Cloud does have a web crawler that can pull content from web-enabled repositories on-premise, but companies are often reluctant to expose sensitive systems in this way.  Web crawling is also limited in terms of its ability to index metadata and security trimming information that most content management systems need indexed.  

To work around those restrictions, Coveo Cloud provides a Push API for uploading content without requiring any external exposure or open ports.  Whether you need to index one document or a million, you simply upload the files, metadata and security information to Coveo Cloud for processing.  Unless you want to convert and extract the content from files yourself (which I do not recommend), you should upload the original binary files to Coveo Cloud.  The indexing pipeline will convert the files, process them for indexing, and create previews for fast viewing online.  Note: all documents are encrypted during transmission and at rest.

The uploading process is very straight-forward.  Full documentation is available [here](https://developers.coveo.com/display/CloudPlatform/Push+API+Usage+Overview), but I will briefly describe the process.  Here are the steps for uploading a large, binary file:

1. Create a Push Source in your Organization.
 * Note the organization id, source id, and API Key - you will need them to execute the remaining steps.
2. Use the API to request a URL for uploading your content.
 * You will be given a pre-signed URL for an encrypted AWS S3 bucket and a fileID used to reference it later.
4. Upload your file to the pre-signed URL.
5. Create a JSON document with all metadata, security information (ACLs), and the fileId given to you in step 2.
6. Upload the JSON document with the Push API.

If you are only uploading a small block of text or a small binary document, you can skip the S3 bucket steps and encode the content directly in the JSON Document.  Follow these steps instead:

1. Create a Push Source in your Organization.
2. Create a JSON document with all metadata, security information. (ACLs), and text-based content or base64-compressed binary content.
3. Upload the JSON document with the Push API.

Your document, including any metadata and binary content will be indexed and searchable very soon, depending on the size and system load.  Documents are considered unique by their documentID (URI).  You can update or delete an existing document by providing the same documentID (URI) again.

### Java Implementation

Using the Push API in Java was fairly simple (and useful for converting some legacy connectors that were written in Java).  The Push API uses standard restful HTTP commands, like PUT, POST and DELETE.  You need to include your API Key as an Authorization header, and the source and organization ids are required in many of the URLs.  

I have created a repository on [GitHub](https://github.com/coveo/pushapi-java) with several examples, and I will add more soon.  I have thoroughly documented the source code and used relatively few third-party libraries, making the code very portable.  Core operations are defined in the `CoveoPushAPI` class, and examples that string together a series of operations to perform an entire use case are in the various `*Test` classes.

For example, this is the process for uploading a document:

{% highlight java %}

String organizationId = "...";
String sourceId = "...";
String accessToken = "..."
String filePath = "..."
String docId = "..."

// Construct CoveoPushAPI object
CoveoPushAPI coveoPushAPI = new CoveoPushAPI(organizationId, sourceId, accessToken);

try {
    // *** Set Source Status to REBUILD ***
    coveoPushAPI.setSourceStatus(STATUS_REBUILD);

    // *** Get Pre-Signed AWS S3 URL for uploading file ***
    AbstractMap.SimpleEntry<String, String> s3File = coveoPushAPI.getS3File();
    String uploadUri = s3File.getKey();
    String fileId = s3File.getValue();

    // *** ZLIB compress file ***
    // Open InputStream to binary file
    InputStream is = new FileInputStream(filePath);
    // Preserve original (pre-compressed) byte size, which we will need later
    int originalFileSize = is.available();
    // Create a temp file to hold the compressed file
    File temp = File.createTempFile("temp", ".zlib");
    // wrap input stream with new zlib inputstream
    InputStream zis = coveoPushAPI.zlibInputStream(is, temp);

    // *** PUT the ZLIB file to S3 ***
    coveoPushAPI.putFileOnS3(zis, uploadUri);
    // delete the temp zlib file, which has now been uploaded to S3
    temp.delete();

    // *** Create JSON Document for Coveo
    StringWriter jsonDocument = new StringWriter();
    JSONWriter jw = new JSONWriter(jsonDocument);
    jw.object();

    jw.key("CompressedBinaryDataFileId");
    jw.value(fileId);

    jw.key("size");
    jw.value(originalFileSize);

    jw.key("date");
    Date date = new Date(new File(filePath).lastModified());
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
    jw.value(sdf.format(date));

    jw.key("FileExtension");
    String extension = FilenameUtils.getExtension(filePath);
    // add period to extension; use .txt if no extension was found
    if(StringUtils.isBlank(extension)) {
        extension = ".txt";
    } else {
        extension = "." + extension;
    }
    jw.value(extension);

    jw.endObject();

    String json = jsonDocument.toString();
    LOGGER.info("JSON Document = " + json);

    // *** PUT the JSON Document on Coveo
    coveoPushAPI.putDocumentOnCoveo(json, docId);

    // *** Set source status back to IDLE
    coveoPushAPI.setSourceStatus(STATUS_IDLE);


} catch (Exception e) {
    LOGGER.log(Level.SEVERE, "Failed to push file", e);
}
{% endhighlight %}

### A Few Tips

* Remember the API Key and other required headers.
* Make note of the various HTTP response codes in the Push API documentation.  For example, not all of the API calls use the same 2xx response code to indicate success.
* Files should be zlib compressed before being uploaded to S3.  I could not find a simple way to do this "stream-to-stream" in Java, so I chose to consume the original input stream into a new, compressed temp file, and then open a stream to the new temp file.  This is safer (memory-wise) than trying to compress to an in-memory byte[].
* Currently, the API gives you a single pre-signed URL for uploading large files to S3.  This precludes the use of the multipart protocol for files larger than 100 MB (which could become an issue when uploading large batches of documents, which I will discuss in a future post).  I am investigating the best way to handle this.  For now, you will have to stream the file to S3 in a single PUT request.
* In metadata, dates must be in UTC.  If you specify a date without a time, it will be interpreted as midnight *UTC*, which is then converted back to the timezone of your organization, which could be the previous day.
* You must provide the file extension, as opposed to the mimetype, of binary files.  This can be a bit odd if your file does not have an extension in your content management system.  I have experimented with using Apache Tiki to get the most appropriate file extension for a given mimetype, and it works well if you find yourself in that situation.  I have inquired about the ability to specify a mimetype instead of a file extension.
* Multivalued metadata should be specified as a JSON array, like `[a, b, c]`.

### Coming Soon

Uploading and deleting one file at a time is obviously just the beginning.  In future articles I will discuss batch processing documents, securing documents with Permissions, and pushing user and group information to Identity Providers.
