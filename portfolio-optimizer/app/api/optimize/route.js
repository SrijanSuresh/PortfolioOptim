import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY, // Ensure your environment variables are correctly loaded
});

const indexName = 'quickstart';

async function createIndex() {
  try {
    await pc.createIndex({
      name: indexName,
      dimension: 1024, // Replace with your model dimensions
      metric: 'cosine', // Use cosine metric for vector similarity
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });
    console.log(`Index ${indexName} created successfully.`);
  } catch (error) {
    console.error('Error creating index:', error);
  }
}

async function embedAndUpsertData() {
  const model = 'multilingual-e5-large';

  const data = [
    { id: 'vec1', text: 'Apple is a popular fruit known for its sweetness and crisp texture.' },
    { id: 'vec2', text: 'The tech company Apple is known for its innovative products like the iPhone.' },
    { id: 'vec3', text: 'Many people enjoy eating apples as a healthy snack.' },
    { id: 'vec4', text: 'Apple Inc. has revolutionized the tech industry with its sleek designs and user-friendly interfaces.' },
    { id: 'vec5', text: 'An apple a day keeps the doctor away, as the saying goes.' },
    { id: 'vec6', text: 'Apple Computer Company was founded on April 1, 1976, by Steve Jobs, Steve Wozniak, and Ronald Wayne as a partnership.' },
  ];

  try {
    const embeddings = await pc.inference.embed(
      model,
      data.map((d) => d.text),
      { inputType: 'passage', truncate: 'END' }
    );

    const index = pc.index(indexName);

    const vectors = data.map((d, i) => ({
      id: d.id,
      values: embeddings[i].values,
      metadata: { text: d.text },
    }));

    await index.namespace('ns1').upsert(vectors);
    console.log('Data upserted successfully.');
  } catch (error) {
    console.error('Error embedding or upserting data:', error);
  }
}

async function performQuery(queryText) {
  const model = 'multilingual-e5-large';

  try {
    const embedding = await pc.inference.embed(model, [queryText], {
      inputType: 'query',
    });

    const index = pc.index(indexName);
    const queryResponse = await index.namespace('ns1').query({
      topK: 3,
      vector: embedding[0].values,
      includeValues: false,
      includeMetadata: true,
    });

    return queryResponse;
  } catch (error) {
    console.error('Error performing query:', error);
  }
}

export async function POST(req) {
  try {
    const { query } = await req.json(); // Get query from request body

    await createIndex(); // Create index
    await embedAndUpsertData(); // Embed and upsert data

    const queryResponse = await performQuery(query); // Perform query
    return new Response(JSON.stringify(queryResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Something went wrong', details: error }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
