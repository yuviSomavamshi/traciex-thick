#!/bin/sh
#
# Simple init.d script conceived to work on Linux systems
# as it does use of the /proc filesystem.
export DATA_FOLDER=`pwd`;
export SETUP_SEER_DIR=/home/pi/data;
export SETUP_PROCESSED_DIR=/home/pi/data/processed;
export SETUP_SEER_RAMAN=/home/pi/data/raman;
export API_KEY='23423432423,3453454343';
export LOCATION='VivoCity backgate'
export CLIENT_ID='b5a3d5c5-821c-40e3-9f47-57c8ec9e9254'

PIDFILE="/tmp/thickclient.pid"
LOG_FILE="/tmp/thickclient.log"
CLIENT_PATH="/home/pi/client"
MAX_OLD_MEMORY=2048

touch $PIDFILE


if [ -f $PIDFILE ]
then
        PID=$(cat $PIDFILE)
fi

case "$1" in
    start)
        if [ -f $PIDFILE ]
        then
                echo "$PIDFILE exists... Checking if process is alive..."
		sleep 1
		if [ ! -z "$PID" ] && [ -d /proc/${PID} ]
		then
			echo "Process is already running or crashed"
		        exit 0
		fi
        fi
        kill -9 `ps -eaf|grep "BREATHALYZER-THICKCLIENT"|grep -v grep|awk '{x=x" "$2}END{print x}'`;
        echo "Starting process..."
        #start-up command
 	cd $CLIENT_PATH;
	./breathalyzer " | PNAME:BREATHALYZER-THICKCLIENT" 1>>$LOG_FILE 2>&1 & echo $! > $PIDFILE 
        sleep 5
        ;;
    stop)
        if [ -z $PIDFILE ]
        then
                echo "$PIDFILE does not exist, process is not running"
        else
 		if [ -z "$PID" ]
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

     status)
        if [ -z $PIDFILE ]
        then
                echo "process is not running"
		exit 0
        else
                if [ -z "$PID" ]
                then
                        echo "Process is not running" 
                        exit 0
                fi
                echo "Process is running"
        fi
        ;;
    *)
        echo "Please use start or stop as first argument"
        ;;
esac
