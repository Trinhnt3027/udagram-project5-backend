import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('attachmentUtils')

// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export function addAttachment(id: string): string {
  logger.info("addAtachment:")
  logger.info(id)
  logger.info(bucketName)

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: id,
    Expires: urlExpiration
  })
  
  logger.info(uploadUrl)
  
  return uploadUrl
}

// export function getDownloadUrl(imageId: string): string {
//   return s3.getSignedUrl('getObject', {
//     Bucket: bucketName,
//     Key: imageId
//   })
// }

export async function deleteAttachment(id: string) {
  try {
    await s3.deleteObject({
      Bucket: bucketName,
      Key: id
    }).promise()
  }
  catch (err) {
    logger.error("Error deleting: " + JSON.stringify(err))
  }
}