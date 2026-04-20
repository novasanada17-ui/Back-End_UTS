import express from "express";
import mysql2 from "mysql2";
import dotenv from "dotenv";
dotenv.config();

let app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error("Gagal koneksi ke database:", err.message);
    } else {
        console.log("Terhubung ke database phpMyAdmin (SQL)");
    }
});

let sendRes = (res, status, message,data=null) => {
    res.status(status).json({
        status: status < 400 ? "success" : "error",
        message, data
    });
};
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        code: 200,
        message: "Selamat Datang di Sistem Kereta Api Mahasigma",
        info: "Sistem ini mengelola data user, kereta, stasiun, dan transaksi tiket.",
        endpoints: {
            users:     "/api/users",
            kereta:    "/api/kereta",
            stasiun:   "/api/stasiun",
            transaksi: "/api/transaksi",
            tiket:     "/api/tiket",
        }
    });
});

//Users
//READ
app.get("/api/users", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let q = req.query.q || "";
    let sql = "SELECT * FROM users";
    let params = [];

    if (q) {
        sql += " WHERE nama LIKE ?";
        params.push("%" + q + "%");
    }
    if (page && limit) {
        let offset = (page - 1) * limit;
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: "error",
                message: "Gagal mengambil data!",
                error: err.message
            });
        }

        sendRes(res, 200, "Data User berhasil diambil!", {
            pagination: { page, limit },
            data: result
        });;
    });
});

app.get("/api/users/:id", (req, res) => {
    let id_user = req.params.id;
    let sql = "SELECT * FROM users WHERE id_user = ?";
    let params = [id_user];

    db.query(sql, params, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: "error",
                message: "Gagal mengambil data user!",
                error: err.message
            });
        }
        if (result.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "User tidak ditemukan!"
            });
        }
        sendRes(res, 200, "Detail User berhasil diambil!", result[0]);;
    });
});

//CREATE
app.post("/api/users", (req, res) => {
    let { nama, email, no_telp } = req.body;
    if (!nama || !email || !no_telp) {
        return sendRes(res, 400, "Data tidak lengkap / key salah!");
    }
    let sql = "INSERT INTO users (nama, email, no_telp) VALUES (?, ?, ?)";
    let params = [nama, email, no_telp];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal menambahkan user!", err.message);
        }
        sendRes(res, 201, "User berhasil ditambahkan!", {
            id_user: result.insertId
        });
    });
});

//UPDATE
app.put("/api/users/:id", (req, res) => {
    let { nama, email, no_telp } = req.body;
    let id_user = req.params.id;
    if (!nama || !email || !no_telp) {
        return sendRes(res, 400, "Data tidak lengkap / key salah!");
    }
    let sql = "UPDATE users SET nama = ?, email = ?, no_telp = ? WHERE id_user = ?";
    let params = [nama, email, no_telp, id_user];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal update user!", err.message);
        }
        if (result.affectedRows === 0) {
            return sendRes(res, 404, "User tidak ditemukan!");
        }
        sendRes(res, 200, "User berhasil diupdate!",{id_user,nama,email,no_telp});
    });
});

//DELETE
app.delete("/api/users/:id", (req, res) => {
    let id_user = req.params.id;
    let sql = "DELETE FROM users WHERE id_user = ?";
    let params = [id_user];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal menghapus user!", err.message);
        }
        if (result.affectedRows === 0) {
            return sendRes(res, 404, "User tidak ditemukan!");
        }
        sendRes(res, 200, "User berhasil dihapus!");
    });
});


//Kereta
//READ
app.get("/api/kereta", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let q = req.query.q || "";
    let sql = `SELECT 
            k.id_kereta,
            k.nama_kereta,
            k.type,
            k.kapasitas,
            k.asal_kota,
            k.tujuan_kota, 
            s.nama_stasiun,
            s.kota
        FROM kereta k
        JOIN stasiun s ON k.id_stasiun = s.id_stasiun`;
    let params = [];
    if (q) {
        sql += " WHERE k.nama_kereta LIKE ?";
        params.push("%" + q + "%");
    }
    if (page && limit) {
        let offset = (page - 1) * limit;
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal mengambil data kereta!", err.message);
        }
        sendRes(res, 200, "Data kereta berhasil diambil!", {
            pagination: { page, limit },
            data: result
        });
    });
});

app.get("/api/kereta/:id", (req, res) => {
    let id_kereta = req.params.id;
    let sql = `
        SELECT 
            k.id_kereta,
            k.nama_kereta,
            k.type,
            k.kapasitas,
            k.asal_kota, 
            s.nama_stasiun,
            s.kota
        FROM kereta k
        JOIN stasiun s ON k.id_stasiun = s.id_stasiun
        WHERE k.id_kereta = ?
    `;
    let params = [id_kereta];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal mengambil data kereta!", err.message);
        }
        if (result.length === 0) {
            return sendRes(res, 404, "Kereta tidak ditemukan!");
        }
        sendRes(res, 200, "Detail kereta berhasil diambil!", result[0]);
    });
});

//CREATE
app.post("/api/kereta", (req, res) => {
    let { nama_kereta, type, kapasitas, asal_kota, tujuan_kota, id_stasiun } = req.body;
    if (!nama_kereta || !type || !kapasitas || !asal_kota || !tujuan_kota || !id_stasiun) {
        return sendRes(res, 400, "Data tidak lengkap / key salah!");
    }
    let sql = "INSERT INTO kereta (nama_kereta, type, kapasitas, asal_kota, tujuan_kota, id_stasiun) VALUES (?, ?, ?, ?, ?, ?)";
    let params = [nama_kereta, type, kapasitas, asal_kota, tujuan_kota, id_stasiun];
    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal menambahkan kereta!", err.message);
        }
        sendRes(res, 201, "Kereta berhasil ditambahkan!", {
            id_kereta: result.insertId
        });
    });
});

//UPDATE
app.put("/api/kereta/:id", (req, res) => {
    let { nama_kereta, type, kapasitas, asal_kota, tujuan_kota, id_stasiun } = req.body;
    let id_kereta = req.params.id;
    if (!nama_kereta || !type || !kapasitas || !asal_kota || !tujuan_kota || !id_stasiun) {
        return sendRes(res, 400, "Data tidak lengkap / key salah!");
    }

    let sql = "UPDATE kereta SET nama_kereta=?, type=?, kapasitas=?, asal_kota=?, tujuan_kota=?, id_stasiun=? WHERE id_kereta=?";
    let params = [nama_kereta, type, kapasitas, asal_kota, tujuan_kota, id_stasiun, id_kereta];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal update kereta!", err.message);
        }
        if (result.affectedRows === 0) {
            return sendRes(res, 404, "Kereta tidak ditemukan!");
        }
        sendRes(res, 200, "Kereta berhasil diupdate!", { id_kereta, nama_kereta, type, kapasitas, asal_kota, tujuan_kota, id_stasiun
        });
    });
});

//DELETE
app.delete("/api/kereta/:id", (req, res) => {
    let id_kereta = req.params.id;
    let sql = "DELETE FROM kereta WHERE id_kereta = ?";
    let params = [id_kereta];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal menghapus kereta!", err.message);
        }
        if (result.affectedRows === 0) {
            return sendRes(res, 404, "Kereta tidak ditemukan!");
        }
        sendRes(res, 200, "Kereta berhasil dihapus!", {
            id_kereta
        });
    });
});

//Stasiun
//READ
app.get("/api/stasiun", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let q = req.query.q || "";
    let sql = "SELECT * FROM stasiun";
    let params = [];

    if (q) {
        sql += " WHERE nama_stasiun LIKE ?";
        params.push("%" + q + "%");
    }
    if (page && limit) {
        let offset = (page - 1) * limit;
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal mengambil data stasiun!", err.message);
        }
        sendRes(res, 200, "Data stasiun berhasil diambil!", {
            pagination: { page, limit },
            data: result
        });
    });
});

app.get("/api/stasiun/:id", (req, res) => {
    let id_stasiun = req.params.id;
    let sql = "SELECT * FROM stasiun WHERE id_stasiun = ?";
    let params = [id_stasiun];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal mengambil data stasiun!", err.message);
        }
        if (result.length === 0) {
            return sendRes(res, 404, "Stasiun tidak ditemukan!");
        }
        sendRes(res, 200, "Detail stasiun berhasil diambil!", result[0]);
    });
});

//CREATE
app.post("/api/stasiun", (req, res) => {
    let { nama_stasiun, kota } = req.body;
    if (!nama_stasiun || !kota) {
        return sendRes(res, 400, "Data tidak lengkap / key salah!");
    }

    let sql = "INSERT INTO stasiun (nama_stasiun, kota) VALUES (?, ?)";
    let params = [nama_stasiun, kota];
    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal menambahkan stasiun!", err.message);
        }
        sendRes(res, 201, "Stasiun berhasil ditambahkan!", {
            id_stasiun: result.insertId
        });
    });
});

//UPDATE
app.put("/api/stasiun/:id", (req, res) => {
    let { nama_stasiun, kota } = req.body;
    let id_stasiun = req.params.id;
    if (!nama_stasiun || !kota) {
        return sendRes(res, 400, "Data tidak lengkap / key salah!");
    }

    let sql = "UPDATE stasiun SET nama_stasiun = ?, kota = ? WHERE id_stasiun = ?";
    let params = [nama_stasiun, kota, id_stasiun];
    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal update stasiun!", err.message);
        }
        if (result.affectedRows === 0) {
            return sendRes(res, 404, "Stasiun tidak ditemukan!");
        }
        sendRes(res, 200, "Stasiun berhasil diupdate!", {id_stasiun,nama_stasiun,kota
        });
    });
});

//DELETE
app.delete("/api/stasiun/:id", (req, res) => {
    let id_stasiun = req.params.id;
    let sql = "DELETE FROM stasiun WHERE id_stasiun = ?";
    let params = [id_stasiun];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal menghapus stasiun!", err.message);
        }
        if (result.affectedRows === 0) {
            return sendRes(res, 404, "Stasiun tidak ditemukan!");
        }
        sendRes(res, 200, "Stasiun berhasil dihapus!", {id_stasiun
        });
    });
});

//Transaksi
//READ
app.get("/api/transaksi", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let q = req.query.q || "";
    let sql = `SELECT 
                    t.id_transaksi, 
                    t.total_harga, 
                    t.status,
                    u.nama, 
                    u.email
               FROM transaksi t
               JOIN users u ON t.id_user = u.id_user`;
    let params = [];

    if (q) {
        sql += " WHERE u.nama LIKE ?";
        params.push("%" + q + "%");
    }
    if (page && limit) {
        let offset = (page - 1) * limit;
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);
    }
    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal mengambil data transaksi!", err.message);
        }
        sendRes(res, 200, "Data transaksi berhasil diambil!", {
            pagination: { page, limit },
            data: result
        });
    });
});

app.get("/api/transaksi/:id", (req, res) => {
    let id_transaksi = req.params.id;
    let sql = `SELECT 
                    t.id_transaksi, 
                    t.total_harga, 
                    t.status, 
                    u.nama, 
                    u.email
               FROM transaksi t
               JOIN users u ON t.id_user = u.id_user
               WHERE t.id_transaksi = ?`;

    db.query(sql, [id_transaksi], (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal mengambil data transaksi!", err.message);
        }
        if (result.length === 0) {
            return sendRes(res, 404, "Transaksi tidak ditemukan!");
        }
        sendRes(res, 200, "Detail transaksi berhasil diambil!", result[0]);
    });
});

//CREATE (+ tiket)
app.post("/api/transaksi", (req, res) => {
    let { total_harga, id_user, status, id_kereta, no_kursi, tanggal_keberangkatan } = req.body;
    if (!total_harga || !status || !id_user || !id_kereta || !no_kursi || !tanggal_keberangkatan) {
        return sendRes(res, 400, "Data tidak lengkap / key salah!");
    }

    db.query(
        "INSERT INTO transaksi (id_user, total_harga, status) VALUES (?, ?, ?)",
        [id_user, total_harga, status],
        (err, result) => {
            if (err) {
                return sendRes(res, 500, "Gagal menambahkan transaksi!", err.message);
            }
            let id_transaksi = result.insertId;

            db.query(
                `INSERT INTO tiket 
                 (id_transaksi, id_kereta, no_kursi, tanggal_keberangkatan)
                 VALUES (?, ?, ?, ?)`,
                [id_transaksi, id_kereta, no_kursi, tanggal_keberangkatan],
                (err2) => {
                    if (err2) {
                        return sendRes(res, 500, "Transaksi berhasil tapi tiket gagal dibuat!", err2.message);
                    }
                    sendRes(res, 201, "Transaksi dan tiket berhasil dibuat!", { id_transaksi, total_harga, status, id_user, id_kereta, no_kursi, tanggal_keberangkatan
                    });
                }
            );
        }
    );
});

//UPDATE (status)
app.put("/api/transaksi/:id", (req, res) => {
    let keysvalid = ["status"];
    let keysbody = Object.keys(req.body);
    let valid = keysbody.every(key => keysvalid.includes(key));
    if (!valid) {
        return sendRes(res, 400, "Hanya boleh update status!");
    }
    
    let { status } = req.body;
    let id_transaksi = req.params.id;
    if (!status) {
        return sendRes(res, 400, "Hanya bisa update status / key salah!");
    }

    db.query(
        "UPDATE transaksi SET status = ? WHERE id_transaksi = ?",
        [status, id_transaksi],
        (err, result) => {
            if (err) {
                return sendRes(res, 500, "Gagal update status transaksi!", err.message);
            }
            if (result.affectedRows === 0) {
                return sendRes(res, 404, "Transaksi tidak ditemukan!");
            }
            sendRes(res, 200, "Status transaksi berhasil diupdate!", { id_transaksi, status
            });
        }
    );
});

//DELETE
app.delete("/api/transaksi/:id", (req, res) => {
    let id_transaksi = req.params.id;
    db.query(
        "DELETE FROM transaksi WHERE id_transaksi = ?",
        [id_transaksi],
        (err, result) => {
            if (err) {
                return sendRes(res, 500, "Gagal menghapus transaksi!", err.message);
            }
            if (result.affectedRows === 0) {
                return sendRes(res, 404, "Transaksi tidak ditemukan!");
            }
            sendRes(res, 200, "Transaksi berhasil dihapus!", {
                id_transaksi
            });
        }
    );
});

//Tiket
//READ
app.get("/api/tiket", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let q = req.query.q || "";
    let sql = `
        SELECT 
            t.id_tiket,
            u.nama,
            u.email,
            k.nama_kereta,
            t.no_kursi,
            t.tanggal_keberangkatan,
            tr.status
        FROM tiket t
        JOIN transaksi tr ON t.id_transaksi = tr.id_transaksi
        JOIN users u ON tr.id_user = u.id_user
        JOIN kereta k ON t.id_kereta = k.id_kereta
    `;
    let params = [];
    if (q) {
        sql += " WHERE u.nama LIKE ? OR k.nama_kereta LIKE ?";
        params.push("%" + q + "%", "%" + q + "%");
    }
    if (page && limit) {
        let offset = (page - 1) * limit;
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal mengambil data tiket!", err.message);
        }
        sendRes(res, 200, "Data tiket berhasil diambil!", {
            pagination: { page, limit },
            data: result
        });
    });
});

app.get("/api/tiket/:id", (req, res) => {
    let id_tiket = req.params.id;
    let sql = `
        SELECT 
            t.id_tiket,
            u.nama,
            u.email,
            k.nama_kereta,
            t.no_kursi,
            t.tanggal_keberangkatan,
            tr.status
        FROM tiket t
        JOIN transaksi tr ON t.id_transaksi = tr.id_transaksi
        JOIN users u ON tr.id_user = u.id_user
        JOIN kereta k ON t.id_kereta = k.id_kereta
        WHERE t.id_tiket = ?
    `;

    db.query(sql, [id_tiket], (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal mengambil data tiket!", err.message);
        }
        if (result.length === 0) {
            return sendRes(res, 404, "Tiket tidak ditemukan!");
        }
        sendRes(res, 200, "Detail tiket berhasil diambil!", result[0]);
    });
});

//DELETE
app.delete("/api/tiket/:id", (req, res) => {
    let id_tiket = req.params.id;
    let sql = "DELETE FROM tiket WHERE id_tiket = ?";
    let params = [id_tiket];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendRes(res, 500, "Gagal menghapus tiket!", err.message);
        }
        if (result.affectedRows === 0) {
            return sendRes(res, 404, "Tiket tidak ditemukan!");
        }
        sendRes(res, 200, "Tiket berhasil dihapus!", {
            id_tiket
        });
    });
});

//Validasi Path
app.use((req, res) => {
    sendRes(res, 404, `Endpoint ${req.originalUrl} tidak ditemukan. Method: ${req.method}`);
});

app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err.stack || err.message);
    sendRes(res, 500, "Terjadi kesalahan pada server", err.message);
});

app.listen(8000, () => console.log("Server running on port 8000"));