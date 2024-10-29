
const AZURE_STORAGE_SAS_URL = "https://linklistsumitkumar.blob.core.windows.net/linklist-files?sp=racwdli&st=2024-10-28T05:19:58Z&se=2024-10-28T16:19:58Z&sv=2022-11-02&sr=c&sig=C01Tu3L2NX4W3WDn9zIDsMef%2B%2BqEEQ8wZeh6KQ03QLE%3D";
const AZURE_BLOB_STORAGE_CONTAINER_NAME = "linklist-files";
const AZURE_STORAGE_ACCOUNT_NAME = "linklistsumitkumar";

import { BlobServiceClient } from "@azure/storage-blob";

export const uploadImageToAzure = async (fileUri, fileName) => {
    try {
        console.log("file uri is ",fileUri);
       
        const blobServiceClient = new BlobServiceClient(AZURE_STORAGE_SAS_URL);

        const containerClient = blobServiceClient.getContainerClient(AZURE_BLOB_STORAGE_CONTAINER_NAME);

        const blockBlobClient = containerClient.getBlockBlobClient(fileName);

        const response = await fetch(fileUri);
        const fileBlob = await response.blob();
        console.log("fileblob is ",fileBlob)

        await blockBlobClient.uploadData(fileBlob, {
            blobHTTPHeaders: { blobContentType: fileBlob.type }
        });

        return blockBlobClient.url;
    } catch (error) {
        console.error("Error uploading image to Azure:", error);
        throw error;
    }
};
