/*
tạo 4 bảng

thêm 1 note
sửa 1 note
xóa 1 note

*/

const addNote = document.querySelector("#js-add-note");
const doNow = document.querySelector("#js-do-now");

// add new note
addNote.addEventListener("click", () => {
  const title = document.getElementById("js-title").value;
  const describe = document.getElementById("js-describe").value;

  // check data from user
  if (title) {
    // get priority
    const selectPriority = document.getElementById("js-priority");
    const priority = selectPriority.options[selectPriority.selectedIndex].value;
    // add note to local store
    let arr = JSON.parse(localStorage.matrix);
    const newNote = {
      id: uuidv4(),
      title,
      describe,
      priority,
    };
    arr.push(newNote);
    localStorage.setItem("matrix", JSON.stringify(arr));
  }
});

// refresh page
const loadLocalStore = () => {
  if (!localStorage.matrix) {
    localStorage.setItem("matrix", JSON.stringify([]));
  }
  const arr = JSON.parse(localStorage.matrix);
  const group = document.querySelectorAll(".js_works");
  // set value title each group
  group[0].innerHTML = "DO NOW";
  group[1].innerHTML = "SCHEDULE";
  group[2].innerHTML = "DELEGATE";
  group[3].innerHTML = "DELETE";
  // add data arr to group
  for (let i = 0; i < arr.length; i++) {
    switch (arr[i].priority) {
      case "Urgent & Important":
        group[0].innerHTML += `<p class="note">${arr[i].title}
        <span class="js-edit-note" value=${arr[i].id}>Edit</span>
        </p>`;
        break;

      case "Important & Not Urgent":
        group[1].innerHTML += `<p class="note">${arr[i].title}
        <span class="js-edit-note" value=${arr[i].id}>Edit</span>
        </p>`;
        break;

      case "Urgent & Not Important":
        group[2].innerHTML += `<p class="note">${arr[i].title}
        <span class="js-edit-note" value=${arr[i].id}>Edit</span>
        </p>`;
        break;

      default:
        group[3].innerHTML += `<p class="note">${arr[i].title}
        <span class="js-edit-note" value=${arr[i].id}>Edit</span>
        </p>`;
    }
  }
};
loadLocalStore();

// create id
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

// set default value matrix to local store
window.onload = () => {
  if (localStorage.matrix) {
    console.log(localStorage.matrix);
  } else {
    const arr = [];
    localStorage.setItem("matrix", JSON.stringify(arr));
  }
};
// edit note
// Get the button that opens the modal
const editNotes = document.getElementsByClassName("js-edit-note");
var modal = document.getElementById("my-modal");
for (let i = 0; i < editNotes.length; i++) {
  // When the user clicks the button, open the modal
  editNotes[i].addEventListener("click", (e) => {
    // find note
    const nodeId = e.target.getAttribute("value");
    // note from local store
    const notes = JSON.parse(localStorage.matrix);
    // get note
    const note = notes.find((note) => note.id == nodeId);

    // set value to edit in session store (one page one edit)
    sessionStorage.setItem("editNote", nodeId);
    // add data to modal
    const title = document.getElementById("js-edit-title");
    const describe = document.getElementById("js-edit-describe");
    const priority = document.getElementById("js-edit-priority");
    title.value = note.title;
    describe.value = note.describe;
    priority.value = note.priority;

    modal.style.display = "block";
  });
}
// save and break
const saveNote = document.getElementById("js-save");
saveNote.addEventListener("click", () => {
  // value of note for user had edit
  const title = document.getElementById("js-edit-title").value;
  const describe = document.getElementById("js-edit-describe").value;
  const priority = document.getElementById("js-edit-priority").value;
  if (title) {
    // note from local store
    const notes = JSON.parse(localStorage.matrix);
    // id to find note need edit
    const noteId = sessionStorage.getItem("editNote");
    // get note
    for (let i = 0; i < notes.length; i++) {
      if (notes[i].id == noteId) {
        notes[i].title = title;
        notes[i].describe = describe;
        notes[i].priority = priority;
        break;
      }
    }
    // clear editNote in session store
    sessionStorage.removeItem("editNote");
    // update local store
    localStorage.setItem("matrix", JSON.stringify(notes));
    modal.style.display = "none";
    location.reload();
  }
});

// exit modal and not save
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  const isBreak = true;
  // note from local store
  const notes = JSON.parse(localStorage.matrix);
  // id to find note need edit
  const noteId = sessionStorage.getItem("editNote");
  // check has change
  const note = notes.find((e) => (e.id = noteId));
  if (note) {
    // value of note for user had edit
    const title = document.getElementById("js-edit-title").value;
    const describe = document.getElementById("js-edit-describe").value;
    const priority = document.getElementById("js-edit-priority").value;
    // check not same
    if (
      note.title != title ||
      note.describe != describe ||
      note.priority != priority
    ) {
      // continue edit
      if (!confirm("Bạn không muốn thực hiện thay đổi này nữa ?")) {
        isBreak = false;
      }
    }
  }
  // finish edit
  if (isBreak) {
    modal.style.display = "none";
    location.reload();
  }
};
// delete a note
const deleteNote = document.getElementById("js-modal-delete");
deleteNote.addEventListener("click", () => {
  if (confirm("Bạn có chắc muốn xóa chứ ?")) {
    // note from local store
    const notes = JSON.parse(localStorage.matrix);
    // id to find note need edit
    const noteId = sessionStorage.getItem("editNote");

    // remove note has id = noteId
    const restNodes = notes.filter((note) => note.id != noteId);
    localStorage.setItem("matrix", JSON.stringify(restNodes));

    // clear editNote in session store
    sessionStorage.removeItem("editNote");
    // break modal
    modal.style.display = "none";
    location.reload();
  }
});
// create 4 note 1 - 2 - 1
// edit title
// edit prority 2 - 1 - 1
// delete 1
