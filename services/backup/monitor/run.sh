#!/bin/bash

cd /workdir

GS_BUCKETS=`cat /workdir/GS_BUCKETS.env`
EMAIL_ALERT=`cat /workdir/EMAIL_ALERT.env`
POSTMARK_API_KEY=`cat /workdir/POSTMARK_API_KEY.env`
POSTMARK_FROM=`cat /workdir/POSTMARK_FROM.env`
ENVIRONMENT=`cat /workdir/ENVIRONMENT.env`

for bucket in $GS_BUCKETS; do
  gsutil cp gs://$bucket/backup.date backup.date-$bucket
  ./env/bin/python email_alert.py backup.date-$bucket $POSTMARK_API_KEY $POSTMARK_FROM $EMAIL_ALERT $ENVIRONMENT $bucket
done
