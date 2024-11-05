const express = require("express");  
const mongoose = require("mongoose");  
const dotenv = require("dotenv");  
const Paciente = require("./user/pacienteModel");  
const controllers = require("./user/pacienteController");  
const upload = require("./user/multer_config");  
const cors = require('cors');  

dotenv.config();  

const app = express();  
app.use(cors({ origin: 'http://localhost:3001' })); // Habilita CORS para tu frontend  
app.use(express.json()); // Middleware de JSON de Express  

// Middleware para loguear las solicitudes  
app.use((req, res, next) => {  
    console.log(`${req.method} ${req.url}`);  
    next();  
});  

//servir archivos estaticos
app.use('/uploads', express.static('uploads'));

// Ruta de Prueba  
app.get("/", (req, res) => {  
    res.send("Hello World.");  
});  

// Ruta para buscar pacientes por nombre, apellido, RUT, sexo, fecha de ingreso y enfermedad
app.get("/pacientes/search", controllers.search);


// Ruta para obtener todos los pacientes  
app.get("/pacientes", controllers.getPacientes);  


// Ruta para obtener un paciente por ID
app.get("/pacientes/:id", controllers.getPaciente);

// Ruta para agregar un nuevo paciente  
app.post("/pacientes", upload.single('fotoPersonal'), async (req, res) => {
  console.log("Req.body:", req.body);
  console.log("Req.file:", req.file);

  // Ahora req.body contiene los campos del formulario
  const { rut, nombre, apellido, edad, sexo, fechaIngreso, enfermedad, revisado } = req.body;
  
  // Crear el nuevo paciente con la información recibida
  const nuevoPaciente = await Paciente.create({
    rut,
    nombre,
    apellido,
    edad,
    sexo,
    fechaIngreso,
    enfermedad,
    revisado: revisado === 'true',
    fotoPersonal: req.file.filename // Utilizar el nombre del archivo generado por Multer
  });

  res.status(201).json({ message: 'Paciente agregado exitosamente', paciente: nuevoPaciente });
});


// Ruta para actualizar un paciente por ID  
app.put("/pacientes/:id", controllers.update);  

// Ruta para eliminar un paciente por ID  
app.delete("/pacientes/:id", controllers.delete);

app.post('/upload', upload.single('foto'), controllers.upload);
 


// Ruta para subir la foto de un paciente  
app.post('/pacientes/photo/:id', upload.single('fotoPersonal'), (req, res) => {  
    if (!req.file) {  
        return res.status(400).json({ message: 'No se recibió ninguna imagen, verifica el campo de archivo.' });  
    }  

    // Actualizar el paciente en la base de datos  
    Paciente.findByIdAndUpdate(req.params.id, { fotoPersonal: req.file.path }, { new: true })  
        .then(updatedPaciente => {  
            if (!updatedPaciente) {  
                return res.status(404).json({ message: 'Paciente no encontrado.' });  
            }  
            res.status(200).json({ paciente: updatedPaciente });  
        })  
        .catch(err => {  
            console.error(err);  
            res.status(500).json({ message: "Error al actualizar el paciente", error: err.message });  
        });  
});  


// Conexión a MongoDB  
mongoose.connect(process.env.MONGO_URI)  
    .then(() => {  
        console.log("Conectado a MongoDB");  
        app.listen(3000, () => {  
            console.log(`La API de Node está corriendo en el puerto 3000`);  
        });  
    })  
    .catch((error) => {  
        console.error("Error al conectar a MongoDB:", error);  
    });  

// Middleware para manejar errores globalmente  
app.use((err, req, res, next) => {  
    console.error(err.stack); // Loguear el error  
    res.status(500).send({ message: 'Algo salió mal!', error: err.message });  
});  
