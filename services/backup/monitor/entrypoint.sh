#!/bin/bash


for bucket in $GS_BUCKETS; do
  if ! gsutil ls gs://$bucket > /dev/null; then
      echo "Expected valid storage bucket at $bucket"
      exit 1
  fi
done

echo $GS_BUCKETS > /workdir/GS_BUCKETS.env
echo $EMAIL_HEALTH_CHECK > /workdir/EMAIL_HEALTH_CHECK.env
echo $EMAIL_ALERT > /workdir/EMAIL_ALERT.env
echo $POSTMARK_API_KEY > /workdir/POSTMARK_API_KEY.env
echo $POSTMARK_FROM > /workdir/POSTMARK_FROM.env
echo $ENVIRONMENT > /workdir/ENVIRONMENT.env

rm -f cron
touch cron

echo "Setting crontab"
echo "30 23 * * * /bin/sh /workdir/run.sh >> /workdir/crontab.log 2>> /workdir/crontab.log" >> cron
echo "0 0 * * 0 /bin/sh /workdir/run_healthcheck.sh >> /workdir/crontab.log 2>> /workdir/crontab.log" >> cron

crontab cron

sh /workdir/run.sh >> /workdir/crontab.log
sh /workdir/run_healthcheck.sh >> /workdir/crontab.log
/etc/init.d/cron start
service cron start
tail -f /workdir/crontab.log
