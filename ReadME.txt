		**********************************************************************
                                             README
		***********************************************************************
                (c) Copyright HealthX., All rights reserved


Product Details
==========================

	Product Name    : Breathalyzer
	Product Version : 1.0.0
	Date of release : 22-July-2021


The readme contains the following main sections:

1. Packing List/Release contents
================================
1. Breathalyzer-ThickClient-1.0.exe
2. breathalyzer-rasp.tgz

2. System Requirements
================================
Hardware : 
	1. 2 GB RAM
	2. 1 CPU
	3. Internet connectivity 
      
Software : 
 OS
	1. Windows
	2. Ubuntu
	3. Raspbian


3. Installation Procedure
================================


	Steps for installing Breathalyzer ThickClient on window OS,
		1. Set the environmental variable 
		CLIENT_ID=<Customer ID obtained from HealthX>
		LOCATION=<Location name of Breathalyzer setup>
		
		2. Copy the Breathalyzer-ThickClient-1.0.exe binary file to windows OS.
		3. Double tap on Breathalyzer-ThickClient-1.0.exe file and for proceed installation press next button after you see pop-up screen.
		
	Steps for installing Breathalyzer ThickClient on Ubuntu/Raspbian
		1. Login with root user, create folder /home/pi
		
			mkdir -p /home/pi;
		
		2. Copy and unzip the bundle file breathalyzer-rasp.tgz to /home/pi path
		
			tar -zxvf breathalyzer-rasp.tgz;
			
		3. After unzipping file, goto path /home/pi/bundle and Install the binary

			cd /home/pi/bundle;
			sh install.sh
			
		4. Now update the Customer ID and location in file /home/pi/client/client.sh at line number 11 and 12
		
			
			
			export LOCATION='<Location name>'
			export CLIENT_ID='<Customer ID obtained from HealthX>'

		5. Now restart the service 
		
		
			sh /home/pi/client/client.sh stop
			sh /home/pi/client/client.sh status
			sh /home/pi/client/client.sh start
			
			

4.Downtime and activity Details
=================================


	Total Activity time:		
	==============================
	Patch Application Time	:	0 Minutes	
	Testing time		:		20 Minutes	
	Roll back time		:		10 minutes	
				      --------------------
	Total Time		:			30 minutes
				      --------------------


5. Technical Support Contact Details
=================================

email: tech@healthx.global