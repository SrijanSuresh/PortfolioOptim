import { useEffect } from 'react';
import { initPinecone } from '../utils/pinecone';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initPinecone().catch(console.error);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
