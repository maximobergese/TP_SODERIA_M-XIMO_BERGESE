const clienteModel = require('../models/clientesModels.js');

class clienteController {
    
    consultar(req, res) {
        try {
            clienteModel.consultar((err, rows) => {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.status(200).json(rows);
                }
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    consultarDetalle(req, res) {
        const { id } = req.params;
        try {
            clienteModel.consultarPorId(id, (err, rows) => {
                if (err) {
                    res.status(400).send(err);
                } else {
                    if (rows.length > 0) {
                        res.status(200).json(rows[0]);
                    } else {
                        res.status(404).json({ mensaje: 'Cliente no encontrado' });
                    }
                }
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    ingresar(req, res) {
        try {
            const { nombre, telefono, direccion, zona, localidad, dni } = req.body;
            clienteModel.ingresar({ nombre, telefono, direccion, zona, localidad, dni }, (err, rows) => {
                if (err) {
                    res.status(400).send(err.message);
                } else {
                    res.status(201).json({
                        idCliente: rows.insertId,
                        nombre,
                        telefono,
                        direccion,
                        zona,
                        localidad,
                        dni,
                        fecha_registro: new Date()
                    });
                }
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    actualizar(req, res) {
        const { id } = req.params;
        try {
            const { nombre, telefono, direccion, zona, localidad, dni } = req.body;
            clienteModel.actualizar(id, { nombre, telefono, direccion, zona, localidad, dni }, (err, rows) => {
                if (err) {
                    res.status(400).send(err);
                } else if (rows.affectedRows == 1) {
                    res.status(200).json({ respuesta: 'Cliente actualizado con éxito' });
                } else {
                    res.status(404).json({ mensaje: 'Cliente no encontrado' });
                }
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    borrar(req, res) {
        const { id } = req.params;
        try {
            clienteModel.borrar(id, (err, rows) => {
                if (err) {
                    res.status(400).send(err);
                } else if (rows.affectedRows == 1) {
                    res.status(200).json({ respuesta: 'Cliente eliminado con éxito' });
                } else {
                    res.status(404).json({ mensaje: 'Cliente no encontrado' });
                }
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
}

module.exports = new clienteController();
