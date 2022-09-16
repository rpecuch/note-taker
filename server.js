const express = require('express');
const path = require('path');
const generateUniqueId = require('generate-unique-id');
const fs = require('fs');
const id = generateUniqueId({
    length: 10,
    includeSymbols: ['@', '#', '%']
})
// const noteData = require('./db/db.json');
//may need to adjust this
const PORT = 3001;
const app = express();
const util = require('util');
const readFromFile = util.promisify(fs.readFile);

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('/api/notes', (req,res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
});

app.post('/api/notes', (req,res) => {
    //add new note to db.json file
    //return new note to client
    res.json(`${req.method} request for ${req.path} received`);
    const { title, text} = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            id
        }
        //obtain existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if(err) {
                console.error(err);
            }
            else {
                const parsedNotes = JSON.parse(data);
                //add new note to file
                parsedNotes.push(newNote);
                //rewrite file with updated review
                fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), (err) => {
                    err ? console.error(err) : console.log('Successfully saved note!')
                }
                );
            }
        });
        const response = {
            status: 'succes',
            body: newNote,
        }
        console.log(response);
        res.status(201).json(response);
    }
    else{
        res.status(500).json('Error in saving note');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    //receive query param containaing note id
    //read all notes from db.json file and remoe the note with the given id
    //rewrite notes to db.json file
    res.json(`${req.method} request for ${req.path} received`);
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Note Taker app listening at http://localhost:${PORT}`);
});