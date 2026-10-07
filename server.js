
const express = require("express");
const db = require("./config/db");
const app = express();

app.use(express.static("public"));


const roleRoutes = require("./routes/roleRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const userRoutes = require("./routes/userRoutes");

app.get("/a/:asset_id", (req, res) => {

    const { asset_id } = req.params;

    const sql = `
        SELECT
            a.asset_id,
            a.asset_tag,
            a.asset_name,
            c.category_name,
            a.status,
            a.location,
            d.department_name,
            u.username AS assigned_to,

            i.serial_number,
            i.model,
            i.manufacturer,
            i.device_type,
            i.cpu,
            i.ram,
            i.storage,
            i.os_type,
            i.os_version

        FROM assets a

        JOIN asset_categories c
            ON a.category_id = c.category_id

        LEFT JOIN departments d
            ON a.department_id = d.department_id

        LEFT JOIN users u
            ON a.assigned_user_id = u.user_id

        LEFT JOIN asset_it_details i
            ON a.asset_id = i.asset_id

        WHERE a.asset_id = ?
    `;

    db.query(sql, [asset_id], (error, results) => {

        if (error) {
            console.log("QR asset query failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to fetch asset"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        res.json({
            message: "Asset found",
            asset: results[0]
        });

    });

});

const assetRoutes = require("./routes/assetRoutes");
const itAssetRoutes = require("./routes/itAssetRoutes");
const vehicleAssetRoutes = require("./routes/vehicleAssetRoutes");



const PORT = 5000;


// JSON middleware
app.use(express.json());


// Test route
app.get("/api/test", (req, res) => {
    res.json({
        message: "AMS backend is working"
    });
});


// Routes
app.use("/api/roles", roleRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/assets/it-details", itAssetRoutes);
app.use("/api/assets/vehicle-details", vehicleAssetRoutes);
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

