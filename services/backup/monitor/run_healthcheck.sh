#!/bin/bash

cd /workdir

EMAIL_HEALTH_CHECK=`cat /workdir/EMAIL_HEALTH_CHECK.env`
POSTMARK_API_KEY=`cat /workdir/POSTMARK_API_KEY.env`
POSTMARK_FROM=`cat /workdir/POSTMARK_FROM.env`
ENVIRONMENT=`cat /workdir/ENVIRONMENT.env`

./env/bin/python email_healthcheck.py $POSTMARK_API_KEY $POSTMARK_FROM $EMAIL_HEALTH_CHECK $ENVIRONMENT
