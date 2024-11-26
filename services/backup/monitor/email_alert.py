
import sys
import pystmark
import logging
import datetime

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

input_file = sys.argv[1]
postmark_api_key = sys.argv[2]
postmark_from = sys.argv[3]
postmark_to = sys.argv[4]
environment = sys.argv[5]
bucket = sys.argv[6]

date_str = None
with open(input_file) as f:
    date_str = f.read().strip()

now = datetime.datetime.now()
date_list = date_str.split('-')
date = datetime.datetime(
    year=int(date_list[0]),
    month=int(date_list[1]),
    day=int(date_list[2]),
    hour=int(date_list[3]),
    minute=int(date_list[4]),
)
delta = (now - date)
num_days_ago = delta.days
status = 'OK'
if num_days_ago > 1:
    status = 'FAIL'
logging.info('Evaluating date_str={}, num_days_ago={}, status={}, environment={}, bucket={}'.format(date_str, num_days_ago, status, environment, bucket))

if status == 'FAIL':
    logging.info('Sending out alert message to {}'.format(postmark_to))
    message = pystmark.Message(
        sender=postmark_from,
        to=postmark_to,
        subject='Alert: Backup failure for {} in {} environment'.format(bucket, environment),
        text='Did not see a backup for two days (bucket={}, environment={}, date_str={})'.format(bucket, environment, date_str)
    )
    response = pystmark.send(message, api_key=postmark_api_key)

with open('checks.log', 'a+') as f:
    date_log_str = '{}/{}/{} {}:{}'.format(date.year, date.month, date.day, date.hour, date.minute)
    check_log_str = '{}/{}/{} {}:{}'.format(now.year, now.month, now.day, now.hour, now.minute)
    f.write('Backup {} {} checked at {}, status: {}\n'.format(bucket, date_log_str, check_log_str, status))
