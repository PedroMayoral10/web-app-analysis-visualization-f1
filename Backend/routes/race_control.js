var express = require('express');
var router = express.Router();
const { connectToDB_OpenF1 } = require('../db_mongo');

// Obtener toda la información que comunica control de carrera por session_key 
router.get('/openf1/race_control/:session_key', async function(req, res) {
    
    const { session_key } = req.params;
    const { sim_time, last_date } = req.query; 

    try {
        const db = await connectToDB_OpenF1();
        let query = { 
            session_key: parseInt(session_key),
            date: { $lte: new Date(sim_time) } 
        };

        // Si tenemos la fecha del último mensaje,
        // solo buscamos lo que sea estrictamente posterior a ese.
        if (last_date && last_date !== "null" && last_date !== "undefined") {
            query.date.$gt = new Date(last_date);
        }

        const nuevosMensajes = await db.collection('race_control')
            .find(query)
            .sort({ date: 1 }) // Orden ascendente para que el front los pegue al final
            .project({ _id: 0, message: 1, flag: 1, lap_number: 1, date: 1, category: 1 })
            .toArray();

        res.json(nuevosMensajes);
    } catch (error) {
        res.status(500).json({ error: "Error en el sync de mensajes" });
    }
});

module.exports = router;