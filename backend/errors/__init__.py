class InvalidPayloadError(Exception):
    """InvalidPayloadError is raised when the payload is invalid."""
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return self.message


class PredictionError(Exception):
    """PredictionError is raised when the prediction failed."""
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return self.message


class ForbiddenError(Exception):
    """ForbiddenError is raised when the user is forbidden."""
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return self.message
