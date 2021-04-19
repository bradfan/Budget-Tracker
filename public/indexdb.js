// bring in model/example from class repo (17-26)
let db;
// define indexedDB
const indexedDB = window.indexedDB;
// Create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
   let db = target.result;
  db.createObjectStore("pending", { autoIncrenment: true });
};
request.onsuccess = ({ target }) => {
  db = target.result;
  // app online prior to reading db
  if (navigator.onLine) {
    checkDatabase();
  }
  //   for coming back online and retrieve pending from "const transaction = db.transaction(["pending"], "readwrite");""
};
request.onerror = function (event) {
  console.log("Whoops!" + event.data.errorCode);
};

// this is crucial to the next homework
const saveRecord = (record) => {
  console.log("Save record invoked");
  // Create a transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // Access your BudgetStore object store
  const store = transaction.objectStore("pending");

  // Add record to your store with add method.
  store.add(record);
};

function checkDatabase() {
  console.log("check db invoked");

  // Open a transaction on your BudgetStore db
  const transaction = db.transaction(["pending"], "readwrite");

  // access your BudgetStore object
  const store = transaction.objectStore("pending");

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then(response => {
          return response.json();
        }) 
        .then((res) => {
          // If our returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to BudgetStore with the ability to read and write
            let transaction = db.transaction(["pending"], "readwrite");
            // console error on line 68: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_const_assignment
            // Assign the current store to a variable
            const currentStore = transaction.objectStore("pending");

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log("Clearing store 🧹");
          }
        });
    }
  };
}

// was in the original c/p - don't think it is neccesary
// request.onsuccess = function (e) {
//   console.log('success');
//   db = e.target.result;

//   // Check if app is online before reading from db
//   if (navigator.onLine) {
//     console.log('Backend online! 🗄️');
//     checkDatabase();
//   }
// };

// Listen for app coming back online
window.addEventListener("online", checkDatabase);
