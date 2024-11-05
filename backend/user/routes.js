var express = require('express');
var controller = require('./pacienteController.js');
var upload = require('./multer_config.js');
var router = express.Router();

// Ruta de prueba
router.get('/', (req, res) => {
  return res.send('Ruta de prueba');
});

// Pacientes
router.post('/pacientes', controller.new);
router.get('/pacientes', controller.getPacientes);
router.get('/pacientes/last', controller.getPacientesLast);
router.get('/pacientes/:id', controller.getPaciente);

router.put('/pacientes/:id', controller.update);
router.delete('/pacientes/:id', controller.delete);
router.get('/pacientes/search/:search', controller.search);
router.post('/pacientes/photo/:id', upload, controller.upload);
router.get('/pacientes/photo/:filename', controller.getPhoto);

module.exports = router;
