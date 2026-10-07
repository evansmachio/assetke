const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/", (req, res) => {
    const sql = `
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            r.role_name,
            d.department_name,
            u.status,
            u.created_at
        FROM users u
        JOIN roles r
            ON u.role_id = r.role_id
        LEFT JOIN departments d
            ON u.department_id = d.department_id
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.log("Database query failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to fetch users"
            });
        }

        res.json(results);
    });
});

module.exports = router;