
// initialize a variable db
let db;

// budget database request
const request = indexedDB.open("budget", 1);

// pending object store
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

//onsuccess
request.onsuccess = function (event) {
    db = event.target.result;
    //if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

//handles request errors
request.onerror = function (event) {
    console.log(event.target.errorCode);
};

//save a record to the indexedDB
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
}

//Check the database
function checkDatabase() {
    //open a transaction on the pending object store in the budget db
    const transaction = db.transaction(["pending"], "readwrite");
    //access the pending object store
    const store = transaction.objectStore("pending");
    //get all records from store and set to a variable
    const getAll = store.getAll();
    //handle onsuccess of store.getAll();
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

//listen for app coming back online
window.addEventListener("online", checkDatabase);