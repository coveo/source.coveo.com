---
layout: post

title: "Browser strangelove"
#subtitle: "Or how I learned to stop worrying and love the Desktop Integration Package"

author:
  name: Benoit Garneau
  bio: Product Specialist
  image: megaman.jpg
---

![Post main image]({{ site.baseurl }}/images/20150325/1.jpg)

Not too long ago, a customer opened a case about the troubles he had loading an Office file from a search results page. The file was on his workstation. From his browser, he clicked on the open link to access the local file, only to get an error message.
Curious about this issue, I ran a few tests on a virtual machine with indexed local files, just like the customer did on his side before opening the case.

<!-- more -->

Test one
Typing File:///C:/test/test.jpg on the address bar of IE11.
Test two
<img src=File:///C:\test\test.jpg /> in an html file loaded locally on the machine.
Test three
<img src=File:///C:\test\test.jpg /> in an html file hosted on a distant server.
Test four
<img src=File:///C:\test\test.jpg /> in an html file on a network shared folder.

While the two first tests successfully displayed the image, the last two didn’t show anything, it was like the line was not even in the html file.
By opening the browser’s console, I saw, for both failed attempts, an error message saying “Not allowed to load local resource”.
Interesting fact, the console was the only place where I could see any indication that there was even an attempt to load the local JPEG image. The web page did not show the classic “file unavailable” icon, there was no dialog box, and no mention on the browser’s status bar, like you could expect to see when a pop-up page is blocked.
Unlike for pop-up pages, the browser won’t allow access to local files, it will just ignore the instruction.

But why?

I had to call a developer to find out more about this…

![A photo of me, calling a developer]({{ site.baseurl }}/images/20150325/2.jpg)
 
The developer confirmed that opening a local file from the DIP is performed in a different way. "javascript:window.external.OpenDesktopConnectorUri()" is a javascript call from the Internet Explorer browser embedded in the DIP to a .NET method implemented in the DIP itself. This mechanism is not possible from a standalone browser. This call to the DIP is for working around security restrictions imposed by browsers. Those security restrictions differ from one browser to another (e.g. Chrome vs. IE), and even differ from one version of IE to another, the compatibility view settings, etc.
I later found out that you could bypass the browser’s security by completely disabling the Internet Explorer Local Machine Zone Lockdown, which is like tearing down a whole wall of your house to get all the groceries inside in one trip, but that’s another story.

![Slim Pickins riding a falling bomb with his classic IE logo]({{ site.baseurl }}/images/20150325/3.jpg)
 
Let’s just say that, in the end, if you want to make sure that all your files can be opened through a web browser without sacrificing security, you can host your documents on a cloud based solution.
For any content on your local computer, the Desktop Integration Package is still your best bet.

[Further reading about The desktop integration package.](http://onlinehelp.coveo.com/en/CES/7.0/User/Desktop_Integration_Package.htm)
