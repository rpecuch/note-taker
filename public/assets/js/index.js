//declare variables (not constant)
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

// if on notes page (rather than homepage)
if (window.location.pathname === '/notes') {
  //assign variables to elements
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-container .list-group');
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// used to keep track of the note in the textarea
let activeNote = {};

//list notes that have already been created
const getNotes = () => {
  return fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then((response) => {
    return response.json();
  })
  .catch((error) => {
    console.error('Error: ', error);
  });
};

//saves new note created by user
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  })
  .then((response) => response.json());

//deletes a note
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(() => {
    //update note list
    getAndRenderNotes();
    //call this fxn to prevent deleted note from showing up in text area
    renderActiveNote();
  });

//allows active note to display and does not allow user to edit it
const renderActiveNote = () => {
  hide(saveNoteBtn);
  //if active note exists (not deleted) display in text area as read only
  if (activeNote.id) {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    //remove readonly attribute to allow editing
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    //clear input fields
    noteTitle.value = '';
    noteText.value = '';
  }
};

const handleNoteSave = () => {
  //create new note object from input fields
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  //save note, then update displayed note list and render note that was just created in textarea as read only
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Delete the clicked note
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target;
  //retrieve note id from data-note attribute
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;
  //if active note is the one being deleted then clear it from text field
  if (activeNote.id === noteId) {
    activeNote = {};
  }
  //delete from saved notes
  deleteNote(noteId);
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  //retrieve note info from data-note attribute
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

//only show save btn if both input fields are filled out
const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

// Render the list of note titles
const renderNoteList = async (notes) => {
  //list of retrieved notes
  let jsonNotes = notes;
  if (window.location.pathname === '/notes') {
    //clear previous content to replace with most up to date content
    noteList.forEach((el) => (el.innerHTML = ''));
  }
  //stores current note list items that will be displayed
  let noteListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);
    //if delBtn set to true
    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    //this is the only item pushed to noteListItems if no saved notes, false means no delete btn will be added
    noteListItems.push(createLi('No saved Notes', false));
  }

  jsonNotes.forEach((note) => {
    //call createLi fxn
    const li = createLi(note.title);
    //add data-note attribute to each note
    li.dataset.note = JSON.stringify(note);
    //add to noteListItems
    noteListItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    //display list items for current notes
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => {
  getNotes().then(renderNoteList);
}

//if on notes page (rather than homepage)
if (window.location.pathname === '/notes') {
  //add event listeners for clicks
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  //add event listeners for keyups
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);
}

getAndRenderNotes();