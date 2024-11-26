#!/bin/bash

if ! gsutil ls gs://$BACKUPS_GS_BUCKET > /dev/null; then
    echo "Expected valid storage bucket at BACKUPS_GS_BUCKET"
    exit 1
fi

echo $BACKUPS_GS_BUCKET > /workdir/BACKUPS_GS_BUCKET.env
echo $MONGO_DB > /workdir/MONGO_DB.env
echo $MONGO_HOST > /workdir/MONGO_HOST.env
# echo $MONGO_USER > /workdir/MONGO_USER.env
# echo $MONGO_PASS > /workdir/MONGO_PASS.env

echo "Setting crontab"
echo "30 22 * * * /bin/sh /workdir/run.sh >> /workdir/crontab.log 2>> /workdir/crontab.log" >> cron
crontab cron
rm cron
sh /workdir/run.sh >> /workdir/crontab.log
/etc/init.d/cron start
service cron start
tail -f /workdir/crontab.log
