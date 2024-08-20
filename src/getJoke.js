import axios from 'axios';
//import dotenv from 'dotenv';

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
