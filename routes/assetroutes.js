const express = require("express");
const db = require("../config/db");

const router = express.Router();
const QRCode = require("qrcode");

router.get("/qr/:asset_id", async (req, res) => {

    const { asset_id } = req.params;

    try {

        // Check whether the asset exists
        const sql = `
            SELECT asset_id
            FROM assets
            WHERE asset_id = ?
        `;

        db.query(sql, [asset_id], async (error, results) => {

            if (error) {
                console.log("QR asset check failed");
                console.log(error.message);

                return res.status(500).json({
                    message: "Failed to check asset"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Asset not found"
                });
            }

            // URL that will be stored inside the QR code
            const assetUrl = `http://localhost:5000/a/${asset_id}`;

            // Generate QR code
            const qrCode = await QRCode.toDataURL(assetUrl);

            res.json({
                message: "QR code generated successfully",
                asset_id: asset_id,
                asset_url: assetUrl,
                qr_code: qrCode
            });

        });

    } catch (error) {

        console.log("QR generation failed");
        console.log(error.message);

        res.status(500).json({
            message: "Failed to generate QR code"
        });

    }

});

router.get("/", (req, res) => {
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
            a.purchase_date,
            a.purchase_cost,
            a.supplier,
            a.warranty_expiry,
            a.created_at
        FROM assets a
        JOIN asset_categories c
            ON a.category_id = c.category_id
        LEFT JOIN departments d
            ON a.department_id = d.department_id
        LEFT JOIN users u
            ON a.assigned_user_id = u.user_id
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.log("Database query failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to fetch assets"
            });
        }

        res.json(results);
    });
});

router.get("/:asset_id", (req, res) => {

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
            a.purchase_date,
            a.purchase_cost,
            a.supplier,
            a.warranty_expiry,

            i.it_detail_id,
            i.serial_number,
            i.model,
            i.manufacturer,
            i.device_type,
            i.cpu,
            i.ram,
            i.storage,
            i.gpu,
            i.screen_size,
            i.mac_wifi,
            i.mac_ethernet,
            i.ip_address,
            i.hostname,
            i.domain_name,
            i.os_type,
            i.os_version,
            i.os_build,
            i.os_license,
            i.os_install_date,
            i.os_eol_date,
            i.antivirus,
            i.encryption_status,
            i.tpm_status,
            i.bios_version,
            i.admin_rights

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
            console.log("Asset details query failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to fetch asset details"
            });
        }


        if (results.length === 0) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }


        const asset = results[0];


        const response = {
            asset_id: asset.asset_id,
            asset_tag: asset.asset_tag,
            asset_name: asset.asset_name,
            category: asset.category_name,
            status: asset.status,
            location: asset.location,
            department: asset.department_name,
            assigned_to: asset.assigned_to,
            purchase_date: asset.purchase_date,
            purchase_cost: asset.purchase_cost,
            supplier: asset.supplier,
            warranty_expiry: asset.warranty_expiry,

            it_details: asset.it_detail_id
                ? {
                    serial_number: asset.serial_number,
                    model: asset.model,
                    manufacturer: asset.manufacturer,
                    device_type: asset.device_type,
                    cpu: asset.cpu,
                    ram: asset.ram,
                    storage: asset.storage,
                    gpu: asset.gpu,
                    screen_size: asset.screen_size,
                    mac_wifi: asset.mac_wifi,
                    mac_ethernet: asset.mac_ethernet,
                    ip_address: asset.ip_address,
                    hostname: asset.hostname,
                    domain_name: asset.domain_name,
                    os_type: asset.os_type,
                    os_version: asset.os_version,
                    os_build: asset.os_build,
                    os_license: asset.os_license,
                    os_install_date: asset.os_install_date,
                    os_eol_date: asset.os_eol_date,
                    antivirus: asset.antivirus,
                    encryption_status: asset.encryption_status,
                    tpm_status: asset.tpm_status,
                    bios_version: asset.bios_version,
                    admin_rights: asset.admin_rights
                }
                : null
        };


        res.json(response);
    });

});

router.post("/", (req, res) => {

    const {
        asset_tag,
        asset_name,
        category_id,
        status,
        location,
        department_id,
        assigned_user_id,
        purchase_date,
        purchase_cost,
        supplier,
        warranty_expiry,
        created_by
    } = req.body;


    const assetStatus = status || "In Stock";


    // Required fields
    if (!asset_tag || !asset_name || !category_id || !created_by) {
        return res.status(400).json({
            message: "Asset tag, asset name, category ID and created by are required"
        });
    }


    // Check duplicate asset tag
    const checkSql = `
        SELECT asset_id
        FROM assets
        WHERE asset_tag = ?
    `;


    db.query(checkSql, [asset_tag], (error, results) => {

        if (error) {
            console.log("Duplicate check failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to check asset tag"
            });
        }


        if (results.length > 0) {
            return res.status(409).json({
                message: "Asset tag already exists"
            });
        }


        // Insert asset
        const insertSql = `
            INSERT INTO assets (
                asset_tag,
                asset_name,
                category_id,
                status,
                location,
                department_id,
                assigned_user_id,
                purchase_date,
                purchase_cost,
                supplier,
                warranty_expiry,
                created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.query(
            insertSql,
            [
                asset_tag,
                asset_name,
                category_id,
                assetStatus,
                location || null,
                department_id || null,
                assigned_user_id || null,
                purchase_date || null,
                purchase_cost || null,
                supplier || null,
                warranty_expiry || null,
                created_by
            ],
            (error, result) => {

                if (error) {
                    console.log("Asset insertion failed");
                    console.log(error.message);

                    return res.status(500).json({
                        message: "Failed to create asset"
                    });
                }


                res.status(201).json({
                    message: "Asset created successfully",
                    asset_id: result.insertId
                });

            }
        );

    });

});
module.exports = router;