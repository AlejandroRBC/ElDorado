const db = require('../config/db');

const listaAfiliados = (req, res) => {
    try{
        const sql = 'SELECT * FROM afiliado ORDER BY paterno ASC';
        const afiliados = db.prepare(sql).all();
        res.status(200).json(afiliados);
    }catch (error){
        res.status(500).json({message: "Error al obtener afiliados"});
    }
};

//para el buscado de afiliados cuando se quiere asignar un pueto
const buscarAfiliadoPorCI = (req, res) =>{
    const {ci} = req.params;
    try{
        const afiliado = db.prepare('SELECT * FROM afiliado WHERE ci = ?').get(ci);
        if(afiliado) res.json(afiliado);
        else res.status(404).json({message: "No encontrado"});
    }catch (error){
        res.status(500).json({message: "Error en busqueda"});
    }
};    
module.exports = {listaAfiliados, buscarAfiliadoPorCI};