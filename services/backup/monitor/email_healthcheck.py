
import sys
import pystmark
import logging
import datetime

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

postmark_api_key = sys.argv[1]
postmark_from = sys.argv[2]
postmark_to = sys.argv[3]
environment = sys.argv[4]

check_log = None
with open('checks.log') as f:
    check_log = f.read()

now = datetime.datetime.now()
logging.info('Sending out health check message to {}'.format(postmark_to))
message = pystmark.Message(
    sender=postmark_from,
    to=postmark_to,
    subject='Backup report for {}'.format(environment),
    text='This e-mail is to notify you that the backup monitoring system is functioning.\n\nRecent checks:\n\n{}\n'.format(check_log)
)
response = pystmark.send(message, api_key=postmark_api_key)

with open('checks.log', 'w+') as f:
    f.write('')
