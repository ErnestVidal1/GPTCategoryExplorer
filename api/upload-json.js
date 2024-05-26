const fileUpload = require('express-fileupload');
const fs = require('fs');
require('dotenv').config();

module.exports = (req, res) => {
    if (req.method === 'POST') {
        if (!req.files || !req.files.file) {
            return res.status(400).send('No file was uploaded.');
        }

        const jsonFile = req.files.file;
        jsonFile.mv(`/tmp/${jsonFile.name}`, async (err) => {
            if (err) {
                console.error('Error moving the file:', err);
                return res.status(500).send('Error processing file.');
            }

            try {
                const data = fs.readFileSync(`/tmp/${jsonFile.name}`, 'utf8');
                req.session.categoryData = JSON.parse(data);
                console.log('Category data stored in session:', req.session.categoryData);
                res.send({ message: 'File uploaded and processed successfully.' });
            } catch (error) {
                console.error('Error reading or parsing the file:', error);
                res.status(500).send('Error parsing the JSON file.');
            }
        });
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
