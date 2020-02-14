const aws = require('aws-sdk');
const multer = require('multer');

const path = require('path')
const fs = require('fs');

const hashCode = require('./utils/hash');

const config = require('./config');

aws.config.update({
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY
});


const spacesEndpoint = new aws.Endpoint(config.UPLOAD_ENDPOINT);
const s3 = new aws.S3({
    endpoint: spacesEndpoint
});


const originalToPath = (originalName, dateNow, isSmall=false) => {
    const smallMeta = isSmall ? "_small" : "";
    const result =  dateNow.toString(36) + hashCode(originalName) + smallMeta + path.extname(originalName)
    console.log(result)
    return result
}

const Jimp = require('jimp');

///////2  variant with buffer


const storage = multer.diskStorage({
    destination: function (req, file, cd) {
        cd(null, 'upload');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

const upload = multer({
    storage: storage,
    limits: {fileSize: 1 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
            const err = new Error('Extension')
            return cb(err)
        }
        else {return cb(null, true)}
    }
}).single('upload')


function uploadFiles(localPath, uploadFileName) {

    return new Promise((resolve, reject) => {

        console.log(localPath + "   " + uploadFileName)

        fs.readFile(localPath, function (err, file) {
            if (err) {
                console.log("cannot read local " + err)
                reject(err);
            }

            let params = {
                ACL: 'public-read',
                ContentType: "image/jpeg",
                Bucket: 'oosocial',
                Key: uploadFileName,
                Body: file
            };

            s3.upload(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data)
                }
            });
        });

    });
}


async function resizeJimp(buffer , tempAddr,  width, height) {
     const image  = await Jimp.read(buffer)
         await image
             .autocrop()
             .resize(100, 100) // resize
             .quality(70) // set JPEG quality
             .write(tempAddr); // save

}

const UploadUpdateResize =  (req, res, cb) => {
    upload(req, res,  (err) => {
        if (err) {
            return cb(err.code)
        } else {

            let date = Date.now();
            let tempAddress = "upload/temp_small.jpg"

            resizeJimp( 'upload/' + req.file.filename, tempAddress).then( () => {

                Promise.all([uploadFiles('upload/' + req.file.filename, originalToPath(req.file.originalname, date)),
                    uploadFiles(tempAddress, originalToPath(req.file.originalname, date, true))
                ])

                return cb(null)
            })
        }
    })
}

module.exports = UploadUpdateResize