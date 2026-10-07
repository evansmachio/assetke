const express = require("express");
const db = require("../config/db");

const router = express.Router();


router.post("/", (req, res) => {

    const {
        asset_id,
        registration_number,
        vin_number,
        make,
        model,
        year_manufactured,
        engine_number,
        mileage,
        fuel_type,
        transmission,
        color
    } = req.body;


    if (!asset_id) {
        return res.status(400).json({
            message: "Asset ID is required"
        });
    }


    const sql = `
        INSERT INTO asset_vehicle_details (
            asset_id,
            registration_number,
            vin_number,
            make,
            model,
            year_manufactured,
            engine_number,
            mileage,
            fuel_type,
            transmission,
            color
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            asset_id,
            registration_number || null,
            vin_number || null,
            make || null,
            model || null,
            year_manufactured || null,
            engine_number || null,
            mileage || null,
            fuel_type || null,
            transmission || null,
            color || null
        ],
        (error, result) => {

            if (error) {
                console.log("Vehicle details insertion failed");
                console.log(error.message);

                return res.status(500).json({
                    message: "Failed to save vehicle details"
                });
            }


            res.status(201).json({
                message: "Vehicle details saved successfully",
                vehicle_detail_id: result.insertId
            });

        }
    );

});
router.get("/:asset_id", (req, res) => {

    const { asset_id } = req.params;


    const sql = `
        SELECT
            v.vehicle_detail_id,
            v.asset_id,
            v.registration_number,
            v.vin_number,
            v.make,
            v.model,
            v.year_manufactured,
            v.engine_number,
            v.mileage,
            v.fuel_type,
            v.transmission,
            v.color,
            v.created_at,
            v.updated_at
        FROM asset_vehicle_details v
        WHERE v.asset_id = ?
    `;


    db.query(sql, [asset_id], (error, results) => {

        if (error) {
            console.log("Vehicle details query failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to fetch vehicle details"
            });
        }


        if (results.length === 0) {
            return res.status(404).json({
                message: "Vehicle details not found"
            });
        }


        res.json(results[0]);

    });

});

router.delete("/:asset_id", (req, res) => {

    const { asset_id } = req.params;

    const sql = `
        DELETE FROM asset_vehicle_details
        WHERE asset_id = ?
    `;

    db.query(sql, [asset_id], (error, result) => {

        if (error) {
            console.log("Vehicle details deletion failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to delete vehicle details"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Vehicle details not found"
            });
        }

        res.json({
            message: "Vehicle details deleted successfully"
        });

    });

});

module.exports = router;