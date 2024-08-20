# Pact

An example of how to configure Pact for contract testing, using the Chuck Norris API as an example.

https://api.chucknorris.io/

## Project Setup

Create project folder and open it in VS Code.

Run the following command to initialise the project.  
`npm init -y`

Set the type in the package.json file;  
`"type": "module"`  
And use ES6 in the script as installed packages don't play too well with CommonJS.

**Install dependencies:**
The first step is to install the Pact CLI, which is required to interact with Pactflow.

``` 
npm install @pact-foundation/pact-cli
npm install @pact-foundation/pact
npm install axios
npm install chai
npm install chai-as-promised
npm install dotenv
npm install mocha
```

## Folder structure
Create the following folder structure:
``` 
Contract Testing Project Name
├── /pacts
├── /src
│   └── script.js
├── /test
│   ├── /consumer
│   │   └── testscript.js
│   └── /provider
│       └── testscript.js
├── .gitIgnore
└── package.json
```

## Scripts
Next we will need to create the consumer and provider scripts.

**Consumer Tests:** Focus on defining what the consumer (client code) expects from the provider (API). These tests create Pact contracts by interacting with a mock server.  

**Provider Tests:** Focus on verifying that the real API meets the expectations defined in the contracts created by consumer tests.
## Create the consumer script
Create a consumer script and save it in the tests > consumer directory.

``` javascript
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

```

## Create the application code
Create the application code and save it in the 'src' directory.
This can be either consumer or provider specific, or generic. If specific then we may need to change the file directory slightly.

``` javascript
import axios from 'axios';

//Use this code to get the cookie and auth token values from the .env file (if required).
//Do not forget to install the dotenv package using npm install dotenv
//And uncomment the import dotenv line at the top of the file.
/*
dotenv.config();
const { COOKIE: cookieVal } = process.env;
const { AUTH: authTokenVal } = process.env;
*/
  
export const getJokes = async () => {
  try {
    //Uses localhost:1234 as the base URL for the API, not the actual API URL.
    const response = await axios.get('http://localhost:1234/jokes/random', {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch joke');
  }
};
```

## Create the PACT contract

`npx mocha tests/consumer/jokes.js`

This will create a contract inside the 'pact' directory.
It calls the function from getJokes.js in the 'src' directory, that uses Axios to send the request.

Note:
Axios is a popular JavaScript library used to make HTTP requests. It allows you to send asynchronous HTTP requests to REST endpoints and handle responses, making it a common choice for interacting with APIs in web applications. Axios provides a simple API for sending requests and can handle requests and responses in various formats, including JSON.

## Create the provider test script
Create a provider script and save it in the tests > provider directory.

``` javascript
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
```

## Run the provider test

`npx mocha tests/provider/jokes.js`

This will use the contract in the 'pact' directory and validate the API behaviour to ensure it meets the expectations of the consumer.

If the tests pass the terminal output will show something like this:

``` javascript
[14:21:09.529] INFO (23436): pact-core@14.3.8: Verification successful
Pact Verification Complete!
finished: 0
    ✔ should validate the API against the contract (347ms)

  1 passing (355ms)
```

