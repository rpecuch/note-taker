const express = require('express');
const path = require('path');
const fs = require('fs');
//generates a unique id
const generateUniqueId = require('generate-unique-id');
const id = generateUniqueId({
    length: 10
})
const util = require('util');
const readFromFile = util.promisify(fs.readFile);

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

//displays index.html as home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

//displays notes.html when /notes is visited
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

//retrieves all notes from db.json file
app.get('/api/notes', (req,res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
});

//creates new note and adds it to db.json file
app.post('/api/notes', (req,res) => {
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
                //rewrite file to include new note
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

//deletes specified note from db.json file
app.delete('/api/notes/:id', (req, res) => {
    let requestedId = req.params.id;
    //read all notes from db.json file and remove the note with the given id
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if(err) {
            console.error(err);
        }
        else {
            const parsedNotes = JSON.parse(data);
            for(let i=0; i<parsedNotes.length; i++) {
                const currentNote = parsedNotes[i];
                if(currentNote.id === requestedId) {
                    //remove current note
                    parsedNotes.splice(i, 1);
                }
            }
            //rewrite file with specified note removed
            fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), (err) => {
                err ? console.error(err) : console.log('Successfully deleted note!')
            }
            );
        }
    });
})

//displays homepage if user attempts to visit route that does not exist
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Note Taker app listening at http://localhost:${PORT}`);
});