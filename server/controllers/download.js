const Expenses = require('../models/expenses');
const FileUrls = require('../models/fileUrls');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
require('dotenv').config();

const sequelize = require('../util/database');

exports.getDownload = async (req, res, next) => {
    try{
        const token = req.query.token;
        console.log("Token", token);
        const decoded = await jwt.verify(token, process.env.TOKEN_SECRET);
        const userId= decoded.id;
        const downloads = await FileUrls.findAll({ where:{ id: userId}});

        res.status(200).json({fsuccess: true, downloads: downloads, err: null});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error", downloads: '', success: false, err: error})
    }
};

exports.postDownload = async (req, res, next) => {
    try{
        const token =req.body.token;
        const decoded = await jwt.verify(token, process.env.TOKEN_SECRET);
        const expenses = await Expenses.findAll({ where: {id: decoded.id }});
        console.log(expenses);
        const stringifiedExpenses = JSON.stringify(expenses);
        const userId = decoded.id;
        const filename = `Expenses${userId}/${new Date()}.txt`;
        const fileUrl = await uploadToS3(stringifiedExpenses, filename);
        await FileUrls.create({
            id: userId,
            filename: filename,
            fileUrl: fileUrl
        });
        const downloads = await FileUrls.findAll({ where:{ id: userId}});

        res.status(200).json({fileUrl: fileUrl, success: true, downloads: downloads, err: null});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error", fileUrl: '', downloads: '', success: false, err: error})
    }
    
}

function uploadToS3(data, filename) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
    
    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        //Bucket: BUCKET_NAME
    });
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }
    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if(err){
                console.log('Something went wrong', err);
                reject(err);
            }
            else{
                resolve(s3response.Location);
            }
        })
    })
    

}