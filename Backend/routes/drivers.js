var express = require('express');
var router = express.Router();
const { connectToDB } = require('../db_mongo');

/* GET drivers page. */ // Drivers de la base de datos histórica

router.get('/', async function(req, res, next) {
    try {
        const db = await connectToDB(); // Conexión a la base de datos
        const drivers = await db.collection('drivers').find().toArray(); // Traemos todos los drivers
        res.json(drivers); // Respondemos con los datos en JSON
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener drivers");
    }
});


//Obtener los pilotos de una carrera de la base de datos de OpenF1

router.get('/openf1/:session_key', async function(req, res, next) {
    try {
        const db = await connectToDB();
        const session_key = parseInt(req.params.session_key);
        
        // Buscamos en la colección drivers filtrando por la session_key
        const data = await db.collection('drivers').find({ session_key: session_key }).toArray();
        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener drivers de la sesión desde DB");
    }
});

module.exports = router;
