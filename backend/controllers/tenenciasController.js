const db = require('../config/db');

const listarTenencias = (req, res) =>{
    try{
        const sql = 'SELECT * FROM tenencia_puesto';
        const tenencias = db.prepare(sql).all();
        res.status(200).json(tenencias);
    }catch(error){
        res.status(500).json({message: "Error al obtener historial de tenencias"});
    }
};

module.exports = {listarTenencias};