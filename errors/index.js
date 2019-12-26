class UserNotFoundError extends Error {
    constructor(message) {
        super(message)
    }
}

class AuthError extends Error {
    constructor(message) {
        super(message)
    }
}

class IncompleteRequestError extends Error {
    constructor(message) {
        super(message)
    }
}

module.exports = { UserNotFoundError, AuthError, IncompleteRequestError }