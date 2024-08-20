import path from 'path';
//import dotenv from 'dotenv';
import { Pact, Matchers } from '@pact-foundation/pact';
import { getJokes } from '../../src/getJoke.js';

const provider = new Pact({
  consumer: 'jokeConsumer',
  provider: 'jokeProvider',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'INFO',
  spec: 2,
});

//Use this code to get the cookie and auth token values from the .env file (if required).
//Do not forget to install the dotenv package using npm install dotenv
//And uncomment the import dotenv line at the top of the file.
/*
dotenv.config();
const { COOKIE: cookieVal } = process.env;
const { AUTH: authTokenVal } = process.env;
*/

// Setup the Pact mock server
provider.setup().then(() => {
  // Define the interaction
  provider.addInteraction({
    state: 'all locations are available',
    uponReceiving: 'a request for all locations',
    withRequest: {
      method: 'GET',
      path: '/jokes/random',
      headers: {
        'Accept': 'application/json',
        //Can add these in if needed...
        //'Cookie': cookieVal,
        //'Authorization': authTokenVal,
      },
    },
    willRespondWith: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: Matchers.like({
        "icon_url" : "https://api.chucknorris.io/img/avatar/chuck-norris.png",
        "id" : "dU8JS-1VR1ilWmcydiGu3g",
        "url" : "",
        "value" : "Titanic did'nt sink because of an iceberg, it hit Chuck Norris on his morning swim..."
        }),
    },
  }).then(async () => {
    try {
      const jokes = await getJokes();
      console.log('Test passed: Received jokes:', jokes);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      // Verify the interaction and finalize the provider
      provider.verify().then(() => provider.finalize());
    }
  });
});
