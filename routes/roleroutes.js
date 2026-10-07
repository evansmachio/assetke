const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/", (req, res) => {
    const sql = "SELECT * FROM roles";

    db.query(sql, (error, results) => {
        if (error) {
            console.log("Database query failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to fetch roles"
            });
        }

        res.json(results);
    });
});

module.exports = router;