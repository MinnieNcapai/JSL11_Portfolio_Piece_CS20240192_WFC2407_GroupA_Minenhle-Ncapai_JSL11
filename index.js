// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';
// TASK: import initialData
import { initialData } from './initialData.js';

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  sideBar: document.getElementById("side-bar-div"),
  logo: document.getElementById("logo"),
  themeSwitch: document.getElementById("switch"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),

  headerBoardName: document.getElementById("header-board-name"),
  editBoardBtn: document.getElementById("edit-board-btn"),
  editBoardDiv: document.getElementById("editBoardDiv"),
  columnDivs: document.querySelectorAll(".column-div"),
  addNewTaskBtn: document.getElementById("add-new-task-btn"),
  
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  statusInput: document.getElementById("select-status"),
  createTaskBtn: document.getElementById("create-task-btn"),
  modalWindow: document.getElementById("new-task-modal-window"),

  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  editTaskModal: document.getElementsByClassName("edit-task-modal-window")[0],
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),
  filterDiv: document.getElementById("filterDiv"),
}

let activeBoard = "";
let currentTaskId  = null;

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  //console.log(tasks); // Check what tasks are being retrieved
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard =  localStorageBoard||boards[0]; // FIX: Changed semicolon  
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  } else {
    console.warn("No boards available.");
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => { // FIX: Added an event listener for "click" on boardElement
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);// FIX: Changed assignment operator (=) to equality operator (===) for filtering tasks by board name

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status"); // Get status of the current column
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`; // Set column header

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer); // Append the tasks container to the column

    filteredTasks.filter(task => task.status === status).forEach(task => { // FIX: Changed = to === for filtering tasks by status
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title; // Display task title
      taskElement.setAttribute('data-task-id', task.id); // Store task ID

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click", () => { // FIX: Changed taskElement.click() to addEventListener 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement); // Append task element to the tasks container
    });
  });
}

//function to Refresh the displayed tasks UI
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard); // Refresh tasks based on the active board
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { // FIX: Corrected method name from "foreach" to "forEach"
    
    if(btn.textContent === boardName) {
      btn.classList.add('active'); // FIX: Changed btn.add() to btn.classList.add()
    }
    else {
      btn.classList.remove('active'); // FIX: Changed btn.remove() to btn.classList.remove()
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);  // Log error if column not found
    return;  // Exit function
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);  // Log warning for missing container
    tasksContainer = document.createElement('div'); // Create a new tasks container
    tasksContainer.className = 'tasks-container'; // Set class for styling
    column.appendChild(tasksContainer); // Append to column
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div'; // Set class for styling
  taskElement.textContent = task.title; // Modify as needed // Set task title
  taskElement.setAttribute('data-task-id', task.id); // Store task ID
  
  tasksContainer.appendChild(taskElement); // FIX: Append task element to the tasksContainer
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn'); // Get cancel edit button
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModal)); //FIX:  Replaced click() with addEventListener

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn'); // Get cancel add task button
  cancelAddTaskBtn.addEventListener('click', () => { 
    toggleModal(false); // Close the add task modal
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false)); //FIX:  Replaced click() with addEventListener
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true)); //FIX:  Replaced click() with addEventListener

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Listen for clicks on the "Add New Task" button
  elements.addNewTaskBtn.addEventListener('click', () => {
     // Open the modal when the button is clicked
    toggleModal(true);  // Show add task modal
     // Ensure the filter overlay is visible when the modal is opened
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });


  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    event.preventDefault(); // Prevent default form submission
    addTask(event)
  });

  elements.saveTaskChangesBtn.addEventListener('click', () => {
    if (currentTaskId) {
      saveTaskChanges(currentTaskId);  // Pass the current task ID
    }
  });

  // Attach delete task listener
  elements.deleteTaskBtn.addEventListener('click', () => {
    if (currentTaskId) {
      deleteTask(currentTaskId);
      refreshTasksUI();
      toggleModal(false, elements.editTaskModal);
    }
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; // FIX: Updated modal display using ternary operator
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

// Function to add a new task
function addTask(event) {
  event.preventDefault(); // Prevent default form submission behavior

  //Assign user input to the task object
    const task = {
      title: elements.titleInput.value.trim(),
    description: elements.descInput.value.trim(),
    status: elements.statusInput.value.trim(),
    board: activeBoard, // Assign current active board
     
    };
    const newTask = createNewTask(task); // Create a new task

   // Add the new task to the active board
    if (newTask) {
      addTaskToUI(newTask); // Add the new task to the UI
      toggleModal(false,elements.modalWindow);  // Close the modal
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset(); // Reset the form inputs
      refreshTasksUI(); // Refresh the UI to display updated tasks

      console.log('Task updated:', updatedTask);
    }
}

// Function to toggle sidebar visibility
function toggleSidebar(show) {
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
  elements.sideBar.style.display = show ? 'block' : 'none'; // Show/hide the sidebar
  elements.hideSideBarBtn.style.display = show ? 'block' : 'none';

}

// Function to toggle between light and dark themes
function toggleTheme(event) {
  document.body.classList.toggle("light-theme");
    const isLightTheme = document.body.classList.contains("light-theme");
  
     // Store theme preference in localStorage
    localStorage.setItem("light-theme", isLightTheme ? "enabled" : "disabled");
    elements.themeSwitch.checked = isLightTheme; // Update theme switch status
    elements.logo.src = elements.logo.src
    ? elements.logo.src.replace("dark", "light") 
      : elements.logo.src.replace("light", "dark"); // Switch logo based on current theme
}
     



  // Function to populate and open the edit task modal with task details :  // Set the title,description and status input values
function openEditTaskModal(task) {
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;
 

  currentTaskId = task.id; // Store the current task ID
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

// Function to save changes to an existing task
function saveTaskChanges(taskId) {
  if (!taskId) return; 

   // Create an updated task object with new values:  // Get updated title,description and status from input
  const updatedTask = {
    id: taskId,
    title: elements.editTaskTitleInput.value.trim(),
    description: elements.editTaskDescInput.value.trim(),
    status: elements.editSelectStatus.value.trim(),
    board: activeBoard,  // Assign the active board to the task
  };

  // Update the task with the new details
  putTask(taskId, updatedTask); 
  // Close the edit task modal
  toggleModal(false, elements.editTaskModal); 
// Refresh the UI to reflect the updated tasks
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}