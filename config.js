const dotenv = require('dotenv')
require('dotenv').config()

module.exports = {
    PORT: process.env.PORT || 4000,
    UPLOAD_ENDPOINT: process.env.UPLOAD_ENDPOINT,

}