#!/bin/bash

SOURCE_GS_BUCKET=`cat /workdir/SOURCE_GS_BUCKET.env`
DESTINATION_GS_BUCKET=`cat /workdir/DESTINATION_GS_BUCKET.env`
DATE_STR=`date +%Y-%m-%d-%H-%M`

cd /workdir

gsutil cp -r gs://$SOURCE_GS_BUCKET gs://$DESTINATION_GS_BUCKET
echo $DATE_STR > /workdir/backup.date
if [ ! $? -eq 0 ]; then
    echo "Error copying file to Google Storage!!"
    exit 1
fi
gsutil cp /workdir/backup.date gs://$DESTINATION_GS_BUCKET
