const db = require("./config/db");

db.connect((error) => {
    if (error) {
        console.log("Database connection failed");
        console.log(error.message);
        return;
    }

    console.log("Database connected successfully");

    db.query("SELECT DATABASE()", (error, result) => {
        if (error) {
            console.log("Query failed");
            console.log(error.message);
            return;
        }

        console.log("Query successful");
        console.log(result);
    });
});