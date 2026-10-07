const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.post("/", (req, res) => {

    const {
        asset_id,
        serial_number,
        model,
        manufacturer,
        device_type,
        cpu,
        ram,
        storage,
        gpu,
        screen_size,
        mac_wifi,
        mac_ethernet,
        ip_address,
        hostname,
        domain_name,
        os_type,
        os_version,
        os_build,
        os_license,
        os_install_date,
        os_eol_date,
        antivirus,
        encryption_status,
        tpm_status,
        bios_version,
        admin_rights
    } = req.body;


    if (!asset_id) {
        return res.status(400).json({
            message: "Asset ID is required"
        });
    }


    // Check duplicate serial number
    if (serial_number) {

        const serialCheckSql = `
            SELECT it_detail_id, asset_id
            FROM asset_it_details
            WHERE serial_number = ?
        `;

        db.query(serialCheckSql, [serial_number], (error, results) => {

            if (error) {
                console.log("Serial number duplicate check failed");
                console.log(error.message);

                return res.status(500).json({
                    message: "Failed to check serial number"
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    message: "Serial number already exists"
                });
            }

            checkMacAddresses();

        });

    } else {

        checkMacAddresses();

    }


    // Check duplicate MAC addresses
    function checkMacAddresses() {

        if (!mac_wifi && !mac_ethernet) {
            insertITDetails();
            return;
        }


        const macCheckSql = `
            SELECT it_detail_id, asset_id
            FROM asset_it_details
            WHERE mac_wifi = ?
               OR mac_ethernet = ?
               OR mac_wifi = ?
               OR mac_ethernet = ?
        `;


        db.query(
            macCheckSql,
            [
                mac_wifi || null,
                mac_wifi || null,
                mac_ethernet || null,
                mac_ethernet || null
            ],
            (error, results) => {

                if (error) {
                    console.log("MAC address duplicate check failed");
                    console.log(error.message);

                    return res.status(500).json({
                        message: "Failed to check MAC address"
                    });
                }


                if (results.length > 0) {
                    return res.status(409).json({
                        message: "MAC address already exists"
                    });
                }


                insertITDetails();

            }
        );

    }


    // Insert IT details
    function insertITDetails() {

        const sql = `
            INSERT INTO asset_it_details (
                asset_id,
                serial_number,
                model,
                manufacturer,
                device_type,
                cpu,
                ram,
                storage,
                gpu,
                screen_size,
                mac_wifi,
                mac_ethernet,
                ip_address,
                hostname,
                domain_name,
                os_type,
                os_version,
                os_build,
                os_license,
                os_install_date,
                os_eol_date,
                antivirus,
                encryption_status,
                tpm_status,
                bios_version,
                admin_rights
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                asset_id,
                serial_number || null,
                model || null,
                manufacturer || null,
                device_type || null,
                cpu || null,
                ram || null,
                storage || null,
                gpu || null,
                screen_size || null,
                mac_wifi || null,
                mac_ethernet || null,
                ip_address || null,
                hostname || null,
                domain_name || null,
                os_type || null,
                os_version || null,
                os_build || null,
                os_license || null,
                os_install_date || null,
                os_eol_date || null,
                antivirus || null,
                encryption_status || null,
                tpm_status || null,
                bios_version || null,
                admin_rights || null
            ],
            (error, result) => {

                if (error) {
                    console.log("IT details insertion failed");
                    console.log(error.message);

                    return res.status(500).json({
                        message: "Failed to save IT asset details"
                    });
                }


                res.status(201).json({
                    message: "IT asset details saved successfully",
                    it_detail_id: result.insertId
                });

            }
        );

    }

});
router.get("/:asset_id", (req, res) => {

    const { asset_id } = req.params;

    const sql = `
        SELECT
            i.it_detail_id,
            i.asset_id,
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
            i.admin_rights,
            i.created_at,
            i.updated_at
        FROM asset_it_details i
        WHERE i.asset_id = ?
    `;

    db.query(sql, [asset_id], (error, results) => {

        if (error) {
            console.log("IT details query failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to fetch IT asset details"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "IT asset details not found"
            });
        }

        res.json(results[0]);
    });

});
router.get("/:asset_id", (req, res) => {

    const { asset_id } = req.params;

    const sql = `
        SELECT
            i.it_detail_id,
            i.asset_id,
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
            i.admin_rights,
            i.created_at,
            i.updated_at
        FROM asset_it_details i
        WHERE i.asset_id = ?
    `;

    db.query(sql, [asset_id], (error, results) => {

        if (error) {
            console.log("IT details query failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to fetch IT asset details"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "IT asset details not found"
            });
        }

        res.json(results[0]);
    });

});

router.put("/:asset_id", (req, res) => {

    const { asset_id } = req.params;

    const {
        serial_number,
        model,
        manufacturer,
        device_type,
        cpu,
        ram,
        storage,
        gpu,
        screen_size,
        mac_wifi,
        mac_ethernet,
        ip_address,
        hostname,
        domain_name,
        os_type,
        os_version,
        os_build,
        os_license,
        os_install_date,
        os_eol_date,
        antivirus,
        encryption_status,
        tpm_status,
        bios_version,
        admin_rights
    } = req.body;


    const sql = `
        UPDATE asset_it_details
        SET
            serial_number = ?,
            model = ?,
            manufacturer = ?,
            device_type = ?,
            cpu = ?,
            ram = ?,
            storage = ?,
            gpu = ?,
            screen_size = ?,
            mac_wifi = ?,
            mac_ethernet = ?,
            ip_address = ?,
            hostname = ?,
            domain_name = ?,
            os_type = ?,
            os_version = ?,
            os_build = ?,
            os_license = ?,
            os_install_date = ?,
            os_eol_date = ?,
            antivirus = ?,
            encryption_status = ?,
            tpm_status = ?,
            bios_version = ?,
            admin_rights = ?
        WHERE asset_id = ?
    `;


    db.query(
        sql,
        [
            serial_number || null,
            model || null,
            manufacturer || null,
            device_type || null,
            cpu || null,
            ram || null,
            storage || null,
            gpu || null,
            screen_size || null,
            mac_wifi || null,
            mac_ethernet || null,
            ip_address || null,
            hostname || null,
            domain_name || null,
            os_type || null,
            os_version || null,
            os_build || null,
            os_license || null,
            os_install_date || null,
            os_eol_date || null,
            antivirus || null,
            encryption_status || null,
            tpm_status || null,
            bios_version || null,
            admin_rights || null,
            asset_id
        ],
        (error, result) => {

            if (error) {
                console.log("IT details update failed");
                console.log(error.message);

                return res.status(500).json({
                    message: "Failed to update IT asset details"
                });
            }


            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "IT asset details not found"
                });
            }


            res.json({
                message: "IT asset details updated successfully"
            });

        }
    );

});

router.delete("/:asset_id", (req, res) => {

    const { asset_id } = req.params;

    const sql = `
        DELETE FROM asset_it_details
        WHERE asset_id = ?
    `;

    db.query(sql, [asset_id], (error, result) => {

        if (error) {
            console.log("IT details deletion failed");
            console.log(error.message);

            return res.status(500).json({
                message: "Failed to delete IT asset details"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "IT asset details not found"
            });
        }

        res.json({
            message: "IT asset details deleted successfully"
        });

    });

});

module.exports = router;