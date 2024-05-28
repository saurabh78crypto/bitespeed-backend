import express from "express";
import { pool } from './db.js'
import formDate from "./utils.js";

const Router = express.Router();

// function validateInput(inputEmail, inputPhoneNumber) {
//     const emailRegex = /^[\w-.]+@\w[-\.]+\w{1,}(\.\w{2,})+$/;
//     if(!inputEmail && !inputPhoneNumber){
//         throw new Error('Bothe email and phone number required.')
//     } else if(inputEmail && !emailRegex.test(inputEmail)){
//         throw new Error('Inavalid email format');
//     }
//     if(!inputPhoneNumber || isNaN(Number(inputPhoneNumber))){
//         throw new Error('Invalid phone number format');
//     }
// }

async function identify(req, res) {
    try {
        const { email, phoneNumber } = req.body;
        // validateInput(email, phoneNumber);

        let query = '';
        let params = [];
        let primaryContactId = null;

        if(email!== null && phoneNumber!== null) {
            query = 'SELECT * From Contact WHERE email =? OR phoneNumber =?';
            params = [email, phoneNumber];
        } else if(email!== null) {
            query = 'SELECT * From Contact WHERE email =?';
            params = [email];
        } else if(phoneNumber!== null) {
            query = 'SELECT * From Contact WHERE phoneNumber =?';
            params = [phoneNumber];
        } 

        const [rows] = await pool.query(query, params);

        if (rows.length === 0) {
            const newPrimaryContact = {
                phoneNumber,
                email,
                linkedId: null,
                linkprecedence: "primary",
                createdAt: formDate(new Date()),
                updatedAt: formDate(new Date()),
            };

            const insertResult = await pool.query('INSERT INTO Contact SET?', newPrimaryContact);
            primaryContactId = insertResult.insertId;

        } else {
            if(email) {
                const existingContactsByEmail = await pool.query('SELECT * FROM Contact WHERE email =?', [email]);
                if(existingContactsByEmail.length > 1){
                    const newSecondaryContact = {
                        phoneNumber,
                        email,
                        linkedId: primaryContactId,
                        linkPrecedence: 'secondary',
                        createdAt: formDate(new Date()),
                        updatedAt: formDate(new Date()),
                    };
                    await pool.query('INSERT INTO Contact SET?', newSecondaryContact);
                }
            }

            if(phoneNumber) {
                const existingContactsByPhone = await pool.query('SELECT * FROM Contact WHERE phoneNumber =?', [phoneNumber]);
                if(existingContactsByPhone.length > 1){
                    const newSecondaryContact = {
                        phoneNumber,
                        email: existingContactsByPhone[0].email,
                        linkedId: primaryContactId,
                        linkPrecedence: 'secondary',
                        createdAt: formDate(new Date()),
                        updatedAt: formDate(new Date()),
                    };
                    await pool.query('INSERT INTO Contact SET?', newSecondaryContact);
                }
            }

            await pool.query('UPDATE Contact SET updatedAt =? WHERE id =?', [formDate(new Date()), primaryContactId]);
        } 

        const emails = [...new Set(rows.map(row => row.email))];
        const phoneNumbers = [...new Set(rows.map(row => row.phoneNumber))];
        const secondaryContactIds = rows.filter(row => row.linkPrecedence!== 'primary').map(row => row.id);

        res.status(200).json({
            contact: {
                primaryContactId,
                emails,
                phoneNumbers,
                secondaryContactIds,
            },
        });
    
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

Router.post('/', identify);

export default Router;