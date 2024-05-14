import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';
import fs from 'fs';

const connectionString = '';
const containerName = 'dimage';
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);
const connStrToMap = (connStr: string) => {
  console.log(connStr);
  const arr = connStr.split(';');
  console.log(arr);
  const result = {};
  arr.forEach(item => {
    const kv = item.split('=');
    result[kv[0]] = kv[1];
  });
  return result;
}
const map = connStrToMap(connectionString);
const sharedKeyCredential = new StorageSharedKeyCredential(map['AccountName'], map['AccountKey']);

const uploadBlob = async (buf: Buffer, blobName: string) => {
  const blobClient = containerClient.getBlockBlobClient(blobName);
  await blobClient.upload(buf, buf.length);
  // Create a SAS token for the Blob
  const blobSAS = generateBlobSASQueryParameters({
    containerName: containerClient.containerName,
    blobName: blobClient.name,
    permissions: BlobSASPermissions.parse("r"), // Read, Add, Create, Write, Delete
    expiresOn: new Date(new Date().valueOf() + 86400*1000*1000), // SAS token will be valid for 1000 days
  }, sharedKeyCredential).toString();
  // Form the complete SAS URL
  const sasUrl = blobClient.url + "?" + blobSAS;
  return sasUrl;
};

const blobExists = async (blobName: string) => {
  const blobClient = containerClient.getBlockBlobClient(blobName);
  return await blobClient.exists();
};

const main = async () => {
  let filePath = "./d2c9a9f1577549b0888efc9107a35cc1-8a49dbb91fb2b9d682d4aff279359008-fd.mp4";
  const file = await fs.readFileSync(filePath);
  let fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
  const aa = await uploadBlob(file, fileName);
  console.log(aa);
};

main();
console.log('ok');
//ts-node test.ts