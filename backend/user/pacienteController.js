const validator = require('validator');
const Paciente = require('./pacienteModel.js');
const fs = require('fs');
const path = require('path');
const upload = require('./multer_config.js'); // Asegúrate de que esta configuración esté correcta.

const controllers = {
    new: async (req, res) => {
        const params = req.body;

        try {
            // Validar campos requeridos y asegurarse de que no estén vacíos
            const campos = ['rut', 'nombre', 'apellido', 'edad', 'sexo', 'enfermedad'];
            for (const campo of campos) {
                if (!params[campo] || validator.isEmpty(params[campo].toString())) {
                    return res.status(400).send({
                        status: 'error',
                        message: `El campo "${campo}" es obligatorio y no puede estar vacío.`
                    });
                }
            }

            // Si se carga una foto, agregarla a los parámetros
            if (req.file) {
                params.fotoPersonal = req.file.filename; // Guardar el nombre del archivo cargado
            }

            // Asignar valores predeterminados
            params.fechaIngreso = params.fechaIngreso || new Date().toISOString().split('T')[0];
            params.revisado = params.revisado !== undefined ? params.revisado : false;

            // Crear y guardar el nuevo paciente
            const paciente = new Paciente(params);
            await paciente.save();

            return res.status(200).send({
                status: 'success',
                message: 'Paciente guardado exitosamente',
                paciente
            });
        } catch (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al guardar el paciente',
                error: err.message
            });
        }
    },

    update: async (req, res) => {
        const id = req.params.id; // Usar req.params para obtener el ID
        const params = req.body;

        try {
            // Validar campos requeridos
            const campos = ['rut', 'nombre', 'apellido', 'edad', 'sexo', 'enfermedad'];
            for (const campo of campos) {
                if (!params[campo] || validator.isEmpty(params[campo].toString())) {
                    return res.status(400).send({
                        status: 'error',
                        message: `El campo "${campo}" es obligatorio y no puede estar vacío.`
                    });
                }
            }

            // Si se carga una nueva foto, actualizarla
            if (req.file) {
                params.fotoPersonal = req.file.filename; // Actualizar el nombre del archivo cargado
            }

            // Asignar valor predeterminado para revisado si falta
            if (params.revisado === undefined) {
                params.revisado = false;
            }

            const paciente = await Paciente.findOneAndUpdate({ _id: id }, params, { new: true });
            if (!paciente) {
                return res.status(404).send({
                    status: 'error',
                    message: `Paciente con id ${id} no existe`
                });
            }

            return res.status(200).send({
                status: 'success',
                message: 'Paciente actualizado exitosamente',
                paciente
            });
        } catch (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al actualizar el paciente',
                error: err.message
            });
        }
    },

    delete: async (req, res) => {
        const id = req.params.id; // Usar req.params para obtener el ID

        try {
            const paciente = await Paciente.findOneAndDelete({ _id: id });
            if (!paciente) {
                return res.status(404).send({
                    status: 'error',
                    message: `Paciente con id ${id} no encontrado`
                });
            }

            return res.status(200).send({
                status: 'success',
                message: 'Paciente eliminado exitosamente',
                paciente
            });
        } catch (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al eliminar el paciente',
                error: err.message
            });
        }
    },

    // Obtener paciente por ID
    getPaciente: async (req, res) => {
        console.log('Controlador getPaciente');
        const id = req.params.id; // Cambiado a req.params
        console.log('ID:', id);

        try {
            const paciente = await Paciente.findById(id);
            console.log('Paciente:', paciente);

            if (!paciente) {
                return res.status(404).send({
                    status: 'error',
                    message: `Paciente con id ${id} no encontrado`,
                });
            }

            return res.status(200).send({
                status: 'success',
                paciente,
            });
        } catch (err) {
            console.error('Error:', err);
            return res.status(500).send({
                status: 'error',
                message: 'Error interno del servidor',
                error: err.message,
            });
        }
    },

    getPacientes: async (req, res) => {
        const query = Paciente.find({});
        const getLastPacientes = req.body.last; // Cambiado a req.body

        if (getLastPacientes) {
            query.limit(5);
        }

        try {
            const pacientes = await query.sort('_id').exec();
            if (!pacientes || pacientes.length === 0) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontraron pacientes en la colección'
                });
            }

            return res.status(200).send({
                status: 'success',
                pacientes
            });
        } catch (error) {
            return res.status(500).send({
                status: 'error',
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    },

    search: async (req, res) => {
        const { nombre, rut, sexo, fechaIngreso, enfermedad } = req.query;

        const filtro = {};
      
        if (nombre) {
            filtro.$or = [
              { nombre: { $regex: nombre, $options: 'i' } },
              { apellido: { $regex: nombre, $options: 'i' } },
            ];
          }
          
        if (rut) {
            filtro.$or = filtro.$or ? [...filtro.$or, { rut: { $regex: rut, $options: 'i' } }] : 
            [{ rut: { $regex: rut, $options: 'i' } }];
          }
          
      
        if (sexo) {
          filtro.sexo = sexo;
        }
      
        if (fechaIngreso) {
          filtro.fechaIngreso = { $gte: new Date(fechaIngreso) };
        }
      
        if (enfermedad) {
          filtro.enfermedad = enfermedad;
        }
      
        try {
          const pacientes = await Paciente.find(filtro).sort({ createdAt: 'descending' });
      
          if (!pacientes || pacientes.length <= 0) {
            return res.status(404).send({
              status: 'error',
              message: `No se encontraron pacientes con el criterio de búsqueda`,
            });
          }
      
          return res.status(200).send({ status: 'success', pacientes });
        } catch (err) {
          console.error('Error al buscar documentos:', err);
          return res.status(500).send({
            status: 'error',
            message: 'Error al buscar documentos',
            error: err.message,
          });
        }
      },
      

    upload: async (req, res) => {
        const file = req.file;
        const id = req.params.id; // Cambiado a req.params

        if (!file) {
            return res.status(400).send({
                status: 'error',
                message: 'El archivo no puede estar vacío o no es válido'
            });
        }

        try {
            const paciente = await Paciente.findOneAndUpdate(
                { _id: id },
                { fotoPersonal: file.filename },
                { new: true }
            );
            if (!paciente) {
                return res.status(404).send({
                    status: 'error',
                    message: `No se pudo guardar la imagen en el paciente con ID: ${id}`
                });
            }

            return res.status(200).send({
                status: 'success',
                message: 'Foto de paciente actualizada exitosamente',
                filename: file.filename,
                paciente
            });
        } catch (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al actualizar la foto del paciente',
                error: err.message
            });
        }
    },

    getPhoto: (req, res) => {
        const file = req.params.filename; // Cambiado a req.params
        const pathfile = path.join(__dirname, 'uploads', file);

        if (fs.existsSync(pathfile)) {
            return res.sendFile(path.resolve(pathfile));
        } else {
            return res.status(404).send({
                status: 'error',
                message: `Imagen con el nombre ${file} no encontrada`
            });
        }
    }
};

module.exports = controllers;
