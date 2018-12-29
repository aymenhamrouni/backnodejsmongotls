const express = require('express');
const bodyparser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('you can upload only image files'), false);
    }
    cb(null, true);
};


const upload = multer({ storage: storage, fileFilter: imageFileFilter });

const uploadRouter = express.Router();
uploadRouter.use(bodyparser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})
    .get(cors.cors,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation is not supported on /imageupload');
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /imageupload');
    })
    .post(cors.corsWithOptions,authenticate.verifyUser,
        authenticate.verifyAdmin,
        upload.single('imageFile'), (req, res) => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(req.file);
        })
    .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('Delete operation is not supported on /imageupload');
    });



module.exports = uploadRouter;