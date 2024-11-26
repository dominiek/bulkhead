#!/bin/bash

if ! gsutil ls gs://$SOURCE_GS_BUCKET > /dev/null; then
    echo "Expected valid storage bucket at BACKUPS_GS_BUCKET"
    exit 1
fi

if ! gsutil ls gs://$DESTINATION_GS_BUCKET > /dev/null; then
    echo "Expected valid storage bucket at BACKUPS_GS_BUCKET"
    exit 1
fi

echo $SOURCE_GS_BUCKET > /workdir/SOURCE_GS_BUCKET.env
echo $DESTINATION_GS_BUCKET > /workdir/DESTINATION_GS_BUCKET.env

rm -f cron
touch cron

echo "Setting crontab"
echo "30 21 * * * /bin/sh /workdir/run.sh >> /workdir/crontab.log 2>> /workdir/crontab.log" >> cron

crontab cron

sh /workdir/run.sh >> /workdir/crontab.log
/etc/init.d/cron start
service cron start
tail -f /workdir/crontab.log
