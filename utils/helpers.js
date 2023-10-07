const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.imageExists = async (Key) => {
  try {
    await s3
      .getObject({
        Bucket: process.env.BUCKET,
        Key,
      })
      .promise();
    return true;
  } catch {
    return false;
  }
};
