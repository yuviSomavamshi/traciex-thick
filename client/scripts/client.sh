#!/bin/sh
#
# Simple init.d script conceived to work on Linux systems
# as it does use of the /proc filesystem.
source ~/.bashrc
export DATA_FOLDER=`pwd`;
export SETUP_SEER_DIR=/home/pi/data;
export SETUP_PROCESSED_DIR=/home/pi/data/processed;
export SETUP_SEER_RAMAN=/home/pi/data/raman;
export API_KEY='23423432423,3453454343';

PIDFILE="/tmp/thickclient.pid"
LOG_FILE="/tmp/thickclient.log"
CLIENT_PATH="/home/pi/client"
MAX_OLD_MEMORY=2048

touch $PIDFILE

if [ -f $PIDFILE ]
then
	PID=$(cat $PIDFILE)
	if [ "$PID" == "" ]
	then
	        PID=NULL
	fi
fi

case "$1" in
    start)
        if [ -f $PIDFILE ]
        then
                echo "$PIDFILE exists... Checking if process is alive..."
		sleep 1
		if [ -d /proc/${PID} ]
		then
			echo "Process is already running or crashed"
		        exit 0
		fi
        fi
        kill -9 `ps -eaf|grep "BREATHALYZER-THICKCLIENT"|grep -v grep|awk '{x=x" "$2}END{print x}'`;
        echo "Starting process..."
        #start-up command
 	cd $CLIENT_PATH;
	`which node` --max_old_space_size=$MAX_OLD_MEMORY index.js " | PNAME:BREATHALYZER-THICKCLIENT" 1>>$LOG_FILE 2>&1 & echo $! > $PIDFILE 
        sleep 5
        ;;
    stop)
        if [ ! -f $PIDFILE ]
        then
                echo "$PIDFILE does not exist, process is not running"
        else
 		if [ "$PID" == "NULL" ]
 		then
 			echo "Cannot stop process. PID File : $PIDFILE is empty !" 
 			exit 0
 		fi
                echo "Stopping process..."
		kill -15 $PID;
                kill -9 `ps -eaf|grep "BREATHALYZER-THICKCLIENT"|grep -v grep|awk '{x=x" "$2}END{print x}'`;
 		while [ -x /proc/${PID} ]
                do
                    echo "Waiting for process to shutdown ..."
                    sleep 1
                done
                > $PIDFILE
                echo "Process stopped"
        fi
        ;;
    *)
        echo "Please use start or stop as first argument"
        ;;
esac
