// Success code 200: If the code in the try block executes properly

// Accepted code 202: if the code in the try block executes properly, but the server has not finished processing the request

// Error code 304: If the code in the try block executes properly, but the resource such as a id is not found
// Not Modified

// Error code 404: If the code in the try block executes properly, but the resource such as a id is not found
// Not Found

// Error code 400: If the code in the try block does not execute properly, for example if a required field is missing
// Bad Request

// Error code 500: If no error occured during the try block, 
// but the code in the try block did not execute properly
// Internal Server Error

import * as express from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../database';

export const userRouter = express.Router(); 
userRouter.use(express.json()); 

userRouter.get('/', async (req, res) => {
    try {
        // toArray() returns a promise, so await it
        // find({}) returns all users in the database
        // `.?` = optional chaining operator, so if collections.users is undefined, it will not throw an error, instead return undefined
        const users = await collections?.users?.find({}).toArray(); 
        res.status(200).send(users); 
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : 'Unknown error'); 
    }
});

userRouter.get('/:id', async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const user = await collections?.users?.findOne(query); 

        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send(`Failed to find a user with id ${id}`); 
        }
    } catch (error) {
        res.status(404).send(error instanceof Error ? error.message : 'Unknown error'); 
    } 
}); 

userRouter.post('/', async (req, res) => {
    try {
        const user = req.body;
        const result = await collections?.users?.insertOne(user); 

        if (result?.acknowledged) {
            res.status(201).send(`Created new user with id: ${result.insertedId}.`); 
        } else {
            res.status(500).send(`Failed to create new user.`);
        }
    } catch (error) {
        res.status(400).send(error instanceof Error ? error.message : 'Unknown error'); 
    }
})

userRouter.put('/:id', async (req, res) => {
    try {
        const id = req?.params?.id;
        const user = req.body; 
        const query = { _id: new ObjectId(id) };
        const result = await collections?.users?.updateOne(query, {$set: user});

        if (result && result.matchedCount) { // check result first, to prevent TypeError, which would lead to a undefined error message
            res.status(200).send(`Updated user with id: ${id}.`); // if the user is found and updated
        } else if (!result?.matchedCount) { // if result doesn't exist || matched count is 0 (will be swapped to 1, because: !)
            res.status(404).send(`Failed to find user with id: ${id}`); // if the user is not found
        }else {
            res.status(304).send(`Failed to update an user with id: ${id}`); // if the user is found but not updated, because no changes were made
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);    
    }
})

userRouter.delete('/:id', async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const result = await collections?.users?.deleteOne(query); 

        if (result && result.deletedCount) {
            res.status(202).send(`Deleted user with id: ${id}`); 
        } else if (!result) {
            res.status(400).send(`Failed to remove user with id: ${id}`); 
        } else if (!result.deletedCount) {
            res.status(404).send(`Failed to find user with id: ${id}`); 
        }        
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);    
    }
})