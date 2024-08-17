import logging

logger = logging.getLogger('django')


def log_exception(exc):
    """
    Utility method to log exception.
    """
    logger.exception(exc)


def log_error(error):
    """
    Utility method to log error.
    """
    logger.error(error)


def log_message(message):
    """
    Utility method to log message.
    """
    logger.log(logging.WARN, message)
