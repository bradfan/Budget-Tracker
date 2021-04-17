// bring in model/example from class repo (17-26)
let db;
// Create a new db request for a "budget" database.
const request = indexedDB.open('pending',1);

request.onupgradeneeded = ({data}) => {
  let = db = data.result;
  db.createObjectStore("pending", {autoIncrenment: true}); 
};

request.onsuccess = ({data}) => {
    db = data.result;
    // app online prior to reading db
    if (navigator.onLine) {
        checkDatabase();
    }
    //   for coming back online and retrieve pending from "const transaction = db.transaction(["pending"], "readwrite");""
};
request.onerror = function (event) {
  console.log("Whoops!" + event.target.errorCode);
};

// this is crucial to the next homework
const saveRecord = (record) => {
    console.log('Save record invoked');
    // Create a transaction on the BudgetStore db with readwrite access
    const transaction = db.transaction(['BudgetStore'], 'readwrite');
  
    // Access your BudgetStore object store
    const store = transaction.objectStore('BudgetStore');
  
    // Add record to your store with add method.
    store.add(record);
  };

function checkDatabase() {
  console.log('check db invoked');

  // Open a transaction on your BudgetStore db
  let transaction = db.transaction(['pending'], 'readwrite');

  // access your BudgetStore object
  const store = transaction.objectStore('pending');

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // If our returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to BudgetStore with the ability to read and write
            transaction = db.transaction(['pending'], 'readwrite');

            // Assign the current store to a variable
            const currentStore = transaction.objectStore('pending');

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}

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
window.addEventListener('online', checkDatabase);