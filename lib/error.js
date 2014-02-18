/**
 * @file Error类
 * @author Ielgnaw(wuji0223@gmail.com)
 */

function AspfeError (msg) {
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee || this);
    this.message = msg || 'Error';
    this.name = 'AspfeError';
};

AspfeError.prototype.__proto__ = Error.prototype;

module.exports = AspfeError;