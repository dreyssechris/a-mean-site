import * as mongodb from 'mongodb'; 

export interface User {
    name: string;
    email: string;
    password: string;
    _id?: mongodb.ObjectId; // Optional, will be generated by MongoDB
} 