const aws = require('aws-sdk');
const multer = require('multer');

const path = require('path')
const fs = require('fs');
const Jimp = require('jimp');

const hashCode = require('./utils/hash');

const config = require('./config');


//-------------set space parameters ------------------
aws.config.update({
    accessKeyId: config.SPACES_ACCESS_KEY_ID,
    secretAccessKey: config.SPACES_SECRET_ACCESS_KEY
});

const spacesEndpoint = new aws.Endpoint(config.UPLOAD_ENDPOINT);
const s3 = new aws.S3({
    endpoint: spacesEndpoint
});

//convert file name to new with current date, original file name and add "_small" if thumbnail
const originalToPath = (originalName, dateNow, isSmall=false) => {
    const smallMeta = isSmall ? "_small" : "";
    const result =  dateNow.toString(36) + hashCode(originalName) + smallMeta + path.extname(originalName)
    console.log(result)
    return result
}


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
const getFileSystemDir = () => {
    const rs = () => Math.random().toString(36).slice(-3);
    const dir = config.UPLOAD_ROOT_DIR + "/" + rs() + "/" + rs() + "/";
    return dir;
}

const resizeJimp = async (buffer , tempAddr,  width, height) => {
     const image  = await Jimp.read(buffer)
         await image
             .autocrop()
             .resize(width, height) // resize
             .quality(70) // set JPEG quality
             .write(tempAddr); // save
}

const UploadUpdateResize =  async (req, res, cb) => {
    upload(req, res,  async (err) => {
        if (err) {
            return cb(err.code)
        }
        else try {

            let date = Date.now();
            let tempAddress = "upload/temp_small.jpg"
            const PROJECT_DIR = getFileSystemDir()

            await resizeJimp( 'upload/' + req.file.filename, tempAddress, 140, 140)

            const [resOrigin, resSmall]  = await gitPromise.all(
                [uploadFiles('upload/' + req.file.filename, PROJECT_DIR + originalToPath(req.file.originalname, date)),
                        uploadFiles(tempAddress, PROJECT_DIR + originalToPath(req.file.originalname, date, true)) ]
            )
            return cb(null, resOrigin.Location, resSmall.Location)
        }
        catch (error) {
            return cb(error)
        }
    })
}

module.exports = UploadUpdateResize