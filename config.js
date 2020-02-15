const dotenv = require('dotenv')
require('dotenv').config()

module.exports = {
    UPLOAD_ROOT_DIR: 'upload-light',
    PORT: process.env.PORT || 4000,
    UPLOAD_ENDPOINT: process.env.UPLOAD_ENDPOINT,
    SPACES_ACCESS_KEY_ID: process.env.SPACES_ACCESS_KEY_ID,
    SPACES_SECRET_ACCESS_KEY: process.env.SPACES_SECRET_ACCESS_KEY

}