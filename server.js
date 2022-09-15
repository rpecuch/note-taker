const express = require('express');
const path = require('path');
const noteData = require('./db/db.json');
const generateUniqueId = require('generate-unique-id');
const id = generateUniqueId({
    length: 10,
    includeSymbols: ['@', '#', '%']
})
//may need to adjust this
const PORT = 3001;
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('/api/notes', (req,res) => {
    //read db.json file
    //return all saved notes as json
    res.json(`${req.method} request for ${req.path} received`);
});

app.post('/api/notes', (req,res) => {
    //receive new note to save from req body
    //need to give each note a unique id when it is saved (look into npm packages to do this for you)
    //add new note to db.json file
    //return new note to client
    res.json(`${req.method} request for ${req.path} received`);
})

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