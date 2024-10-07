import * as mongodb from 'mongodb'; 
import { User} from './models/user.model';

// Make collections available to the rest of the application
export const collections: {
    users?: mongodb.Collection<User>
} = {};

export async function connectToDatabase(uri: string) {
    const client = new mongodb.MongoClient(uri); // Initialize Mongoclient which uses connection string to connect to the database
    await client.connect(); 

    const db = client.db('meanStack'); // Get a reference to the database
    await applySchemaValidation(db); // async function, so await it 

    const usersCollection = db.collection<User>('users'); // Get a reference to the users collection || implicitly create a new one if it doesn't exist
                                                          // <User> to all Documents in this collection will conform to User interface
    collections.users = usersCollection; 
}

// Separation of concerns
export async function applySchemaValidation(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "password"],
            additionalProperties: false, // no additional fields allowed
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "'name' is required and is a string",
                    minLength: 2
                },
                email: {
                    bsonType: "string",
                    description: "'position' is required and is a string",
                    minLength: 5
                },
                password: {
                    bsonType: "string",
                    description: "'password' is required and is a string, which is hashed before storing",
                    minLength: 8
                },
            },
        },
    };

    // Add a schema to the collection, to make sure all documents in the collection conform to the schema
    await db.command({ // Use the correct schema incase the collection was manipulated manually 
                       // or maybe a new schema is needed
        collMod: "users", // collection modify 
        validator: jsonSchema // add a validator to the collection to enforce the schema 
    }).catch(async (error: mongodb.MongoServerError) => { // if the collection doesn't exist, create it
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("users", {validator: jsonSchema});
        }
    });
}