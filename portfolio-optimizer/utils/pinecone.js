import { PineconeClient } from '@pinecone-database/pinecone';

const pinecone = new PineconeClient();

async function initPinecone() {
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY, // Your Pinecone API key
    environment: process.env.PINECONE_ENVIRONMENT, // Your Pinecone environment
  });
}

export { pinecone, initPinecone };
