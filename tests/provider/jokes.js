// test/provider/providerTest.mjs
import path from 'path';
import { Verifier } from '@pact-foundation/pact';

// Hardcoded path to the Pact contract file
const PACT_CONTRACT_PATH = path.resolve('pacts/jokeConsumer-jokeProvider.json');

// The base URL of your real API
const PROVIDER_BASE_URL = 'https://api.chucknorris.io'; // Replace with your real API base URL

describe('Pact Verification', () => {
  it('should validate the API against the contract', async function() {
    this.timeout(30000); // Increase timeout if needed

    const opts = {
      provider: 'jokeProvider', // The name of your provider
      providerBaseUrl: PROVIDER_BASE_URL, // Base URL of your real API
      pactUrls: [PACT_CONTRACT_PATH], // Hardcoded path to the Pact contract file
      // Optional: Other options such as state handlers or Pact Broker configuration
    };

    return new Verifier(opts).verifyProvider()
      .then(output => {
        console.log('Pact Verification Complete!');
        console.log(output);
      })
      .catch(error => {
        console.error('Pact Verification Failed:', error);
        throw error;
      });
  });
});
