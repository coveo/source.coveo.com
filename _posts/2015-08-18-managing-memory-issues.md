---
layout: post

title: "TroubleShooting memory issues with CESService7 "

tags: [Memory, issues, troubleshooting, monitoring]

author:
  name: Yan Bussieres
  bio: Product Specialist, Platform 
  twitter: yanbussieres 
  image: ybussieres.png 
---

 This article on confluence: https://developers.coveo.com/display/SupportKB/TroubleShooting+memory+issues+with+CESService7 explains the procedure in a more detailed way. 
By default, CESService7 should not use more than 50% of the RAM. This way, CES won’t monopolize all the available resources. 

However, sometimes the CES service is going to take more than 50% of the total RAM. The best way to find out why the service has this behaviour is to create dump files.
<!-- more -->

There is an easy way to do that with Windows Server 2003, using User Mode Process Dumper 8.1, but this software doesn’t work on more recent versions of the Windows, that is Windows server 2008 and Windows server 2012. 

So, basically, my goal was to find a way to replicate what User Mode Process Dumper is doing on the newer versions of Windows Server: Create an automatic process to monitor the CES service memory usage, and then create multiple dump files when the RAM used by CES service is spiking over 50%.  To avoid multiple problems, I also added the option to automatically close CES service when this situation happens

###ProcDump

<a href="https://technet.microsoft.com/en-ca/sysinternals/dd996900.aspx" rel="some text">![image](https://github.com/ybussieres/pictures/blob/master/ProcDumpLogo.PNG)</a>

[ProcDump](https://technet.microsoft.com/en-ca/sysinternals/dd996900.aspx) is a free software who allows you to create dump files directly from the command line. 

Let’s take this example 
    
    c:\procdump.exe -c 80 -s 5 -n 3 CESService7.exe c:\procdumps

ProcDump is going to create multiple dump files, three in this case (`- n 3`), with 5 seconds intervals (`-s 5`) when the program (`CESService7.exe`) is using more than 80% of CPU (`-c 80`). The dump files will be created in the folder prodcumps (`c:\procdumps`). 


Unfortunately, there is no options to kill the program after creating the dump files. This can be a problem, because the server can become very slow and experience performance issues. Using Windows monitoring tool on the RAM we can automatically start a script that will start ProcDump and terminate the program in fault (CES Service).

### Performance Monitor and Task Scheduler

First, the Performance monitor, `perfmon.exe` is built-in Windows 8. It will allows you to monitor the memory usage of a software. We need to create a monitor that will trigger an action when more than 50% of memory is used by CES service. To set this properly we will set the limit at n/2 + 500 MB. `n` represent the amount of RAM available. If we have 16GB of RAM, the limit will be 8.5gb. The 500 MB buffer is optional, but it will allow CES service to continue running if there is a minor glitch in the memory usage. For more accurate results, you could decrease this value to 50 MB depending on your final purpose.
 
We then need to trigger an event when CESService uses more than 8.5 GB of RAM out of 16GB. Using the task scheduler we can trigger this alarm. 

### Task Scheduler
 
The task Scheduler can be found under the administrative tools. It is used with Performance Monitor in order to trigger actions depending on settings we previously created. In our case, we need to create an alarm that will open a .bat file. This script can be found [here](https://github.com/Coveo/samples/blob/master/batch-file/ScriptDumpFiles.bat) .

This script is going to run as an administrator and execute ProcDump if you choose to run the alarm with the highest privileges. After the dump files are created, CES Service will be forced to quit. 

In pseudo code, it would look like this: 

    Performance monitor running in background 
     If memory used by CES service spikes over limit:
      Trigger the alert created in Task Scheduler 
     If triggered: 
      RUN ScripDumpFiles.bat 
       Create Dump Files for CESCrawlers.exe, CESConverters.EXE, CesService.exe
       Force to quit CESService 

### Mail Alert 

You can also configure an email alert when this happens by adding this line in the file:  

    CALL blat -to user@example.com -server smtp.example.com -f sender@example.com -subject "subject" -body "body"


It is also possible to send an e-mail directly from the task scheduler, but apparently there is an unfixed bug with Windows 8 that won’t allow an e-mail to be sent.

<a href="http://answers.microsoft.com/en-us/windows/forum/windows_8-desktop/error-message-the-following-error-was-reported/a1e0fd7e-61c3-41aa-85ed-935ba22cf135" rel="Microsoft Error">![image](https://github.com/ybussieres/pictures/blob/master/alertWindows.PNG)</a>


### Managing CPU usage

From the task manager, it is possible to restrain the CPU usage for a program. We can choose which processors are allowed to run a program. If there is, let’s say, 8 CPU availables, we could allow processors 1 to 5 to be used by a program. The program will only use 5/8 of the resources available.  

### Conclusion 

I hope this blog will help people experiencing memory issues. If you want to go further, you can monitor every programs that is running on your computer ! But don't forget to settle the `bat` file the right way... 

