from slack_sdk.errors import SlackApiError
from slack_sdk import WebClient
from common.models import SlackMessageLogs
import os

SLACK_API_TOKEN = os.environ.get("SLACK_API_TOKEN")
SLACK_CHANNEL_ID = os.environ.get("SLACK_CHANNEL_ID")

slack_client = WebClient(token=SLACK_API_TOKEN)


def send_slack_message(message):
    try:
        slack_client.chat_postMessage(channel=SLACK_CHANNEL_ID, text=message)
        SlackMessageLogs.objects.create(message=message, delivered=True)
    except SlackApiError as e:
        SlackMessageLogs.objects.create(message=message, delivered=False)
        print(f"Error: {e.response['error']}")
