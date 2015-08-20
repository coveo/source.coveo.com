---
layout: post

title: "TroubleShooting memory issues with CESService7 "

author:
  name: Yan Bussieres
  bio: Product Specialist, Platform 
  twitter: yanbussieres 
  image: ybussieres.png 
---

/// Comment : This article on confluence: https://developers.coveo.com/display/SupportKB/TroubleShooting+memory+issues+with+CESService7 explains the procedure in a more detailed way. This article also needs revision/approval. If you could include the link to my article at the beggining of the blog once everything is fine, it would be appreciated. Thanks, and sorry for messing up the blog. ///


By default, CESService7 should not use more than 50% of the RAM. This way, CES won’t monopolize the whole resources available. 

However, sometimes, the CES service is going to take more than 50% of the total RAM. The best way to find out why CES service have this behaviour is to create dump files when this happens. 

There was an easy way to do that with Windows Server 2003, using User Mode Process Dumper 8.1, but this software won’t run with Windows server 2008 and Windows server 2012. 

So, basically, my goal was to find a way to replicate what User Mode Process Dumper was doing on the recent versions of Windows Server: create an automatic process to monitor the CES service usage of memory, and then create multiple dump files when the RAM used by CES service was spiking over 50%.  To avoid multiple problems, I also added the option to close automatically CES service when this situation is happening. 

<!-- more -->

### ProcDump ###

![image]({{ site.baseurl }}/images/ProcDumpImage.png)

ProcDump 

ProcDump is a free software who allows you to create dump files with different situations directly from the command line. 

Let’s take this example 
c:\procdump.exe -c 80 -s 5 -n 3 CESService7.exe c:\procdumps

ProcDump is going to create multiple dump files, three in this case (- n 3), with 5 seconds intervals (-s 5) when the program (CESService7.exe ) is using more than 80% of CPU (-c 80). The dump files will be created in the folder prodcumps (c:\procdumps). 

You can download and read more about ProcDump [here](https://technet.microsoft.com/en-ca/sysinternals/dd996900.aspx) 

But, unfortunately, there is no option to kill the program after creating the dump files. And this is a big problem, because the server can become very slow and experience performance issues. There is a way to monitor the RAM with the windows tool. This way, we can automatically start a script who will start ProcDump and terminate the program.

### Performance Monitor and Task Scheduler ###

First, the Performance monitor, perfmon.exe is built-in Windows 8. It will allows you to monitor the memory usage of CES service. So, we need to create a monitor that will trigger an action when more than 50 % is used by Ces service. To set this properly, we will set the limit at n/2 + 500 MB. N represent the amount of RAM available. So if we have 16GB of RAM, the limit will be                8 500 000 000. The 500 MB buffer is optional, but it will allow CES service to continue running if there is a minor glitch in the memory usage. For more accurate result, you could decrease this value to 50 MB depending on your final purpose.
 
Then, an event will be triggered when CESService use more than 8.5 GB of RAM out of 16GB. This alarm will trigger an alert from the... 

### Task Scheduler ###
 
Task Scheduler can be found under the administrative tools. It is used with Performance Monitor in order to trigger an action depending on settings we previously create on the Performance Monitor. In our case, we need to create an alarm that will open a .bat file. This script can be found [here](https://github.com/Coveo/samples/blob/master/batch-file/ScriptDumpFiles.bat) .

This script is going to run directly as an administrator and run ProdDump if you choose to run the alarm with the highest privileges. After the dump files are created, CesService will be forced to quit. 

In pseudo code, it would look like this: 


![image]({{ site.baseurl }}/images/PseudoCode.png)

### Mail Alert ###

You can also configure an e-mail alert when this arrive adding this command line in the .bat file:  

CALL blat -to user@example.com -server smtp.example.com -f sender@example.com -subject "subject" -body "body"

It is also possible to send an e-mail directly from the task scheduler, but apparently there is an unfixed bug with Windows 8 that won’t allow an e-mail to be sent.


### Managing the CPU usage ###

From the task manager, it is possible to restrain the CPU usage for a program. We can choose which processors are allowed to run a program. This way, if there is, let’s say, 8 CPU availables, we could allow processors 1 to 5 to be used by a program. The program will only use 5/8 of the resources available.   
