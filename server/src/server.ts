import * as dotenv from 'dotenv'; 
import express from 'express'; 
import cors from 'cors';
import { connectToDatabase } from './database';
import { userRouter } from './routes/user.routes'; 

dotenv.config(); // loads encrypted variables into process.env, which holds all the environment variables
const { ATLAS_URI } = process.env; // destructured assignment | alt: process.env.ATLAS_URI
const { PORT } = process.env;

if(!ATLAS_URI) {
    console.error('No connection string found'); 
    process.exit(1); // stop the application from starting without waiting for async functions to finish
}

connectToDatabase(ATLAS_URI).then(() => {
    const app = express();
    app.use(cors());

    app.use('/users', userRouter); // all routes in user.routes are prefixed with /users
    // start the Express server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}...`);
    });
  })
  .catch((error) => console.error(error)); // no instanceOf Error needed, just a generic error