var mongoose = require('mongoose')
var Schema = mongoose.Schema

// agregar atributos al objeto
var pacienteSchema = Schema({
    rut: { type: String, required: true },
    nombre: String,
    apellido: String,
    edad: Number,
    sexo: String,
    fotoPersonal: String,
    fechaIngreso: { type: Date, default: Date.now },
    enfermedad: String,
    revisado: { type: Boolean, default: false }
  })
 

//exportar el schema
module.exports = mongoose.model('paciente', pacienteSchema);