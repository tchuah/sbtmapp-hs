/**
 * Author: Tommy Chuah
 * Last Modified: October 13rd, 2021
 * Downloaded: npm install @azure/storage-blob
 */

 import { Injectable } from '@angular/core';
 import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
 
 @Injectable({
   providedIn: 'root'
 })
 export class AzureBlobStorageService {
 
   // URL Variable
   accountName = 'sbtaitrek';
   // containerName = 'report';
   // sas = 'sp=racwdl&st=2021-10-04T01:50:36Z&se=2022-10-04T09:50:36Z&spr=https&sv=2020-08-04&sr=c&sig=%2B5fLlzmtRT4yuEPHXnZjcJ6onZqmOMuKyqpzrLZH%2FtQ%3D'
   
   constructor() { }
 
   /**
    * Purpose: Get the file content and upload to Azure Blob Storage
    * @param content Targeted File from event
    * @param name Name of the file
    */
    public uploadFile(content: Blob, name: string, containerName: string, sas: string){
 
     const blockBlobClient = this.containerClient(containerName, sas).getBlockBlobClient(name);
     blockBlobClient.uploadData(content, { blobHTTPHeaders: { blobContentType: content.type} }).then(() => {
       
       console.log('fileUploaded');
     })
   }
 
   public deleteFile(name: string, containerName: string, sas: string) {
     this.containerClient(containerName, sas).deleteBlob(name);
     console.log('fileDeleted');
   }
 
   /**
    * Purpose: To return the connection to the Client server
    * @returns A blobService instance
    */
   private containerClient(containerName: string, sas: string): ContainerClient {
     return new BlobServiceClient(`https://${this.accountName}.blob.core.windows.net/?${sas}`).getContainerClient(containerName);
     // return new BlobServiceClient(`https://${this.accountName}.blob.core.windows.net/${this.containerName}?${this.sas}`).getContainerClient(this.containerName);
   }
 }
 
 /**
  * Sources: https://www.youtube.com/watch?v=cme_mAmR1LA
  */