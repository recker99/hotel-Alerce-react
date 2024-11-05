const fs = require('fs');  
const multer = require('multer');  
const { v4: uuidv4 } = require('uuid'); // Importar la función uuid  

// Verifica si la carpeta 'uploads' existe, si no, créala  
const uploadDir = 'uploads';  
if (!fs.existsSync(uploadDir)) {  
    try {
        fs.mkdirSync(uploadDir);  
    } catch (error) {
        console.error("Error al crear la carpeta uploads:", error);
    }
}  

// Configuración de almacenamiento  
const storage = multer.diskStorage({  
    destination: (req, file, cb) => {  
        // Especificar el destino donde se guardarán las imágenes  
        cb(null, uploadDir);  
    },  
    filename: (req, file, cb) => {  
        const ext = file.originalname.split('.').pop(); // Obtener la extensión del archivo  
        cb(null, `${uuidv4()}.${ext}`); // Usar uuid para el nombre del archivo  
    }  
});  

// Configuración de multer  
const upload = multer({  
    storage: storage,  
    limits: {  
        fileSize: 5 * 1024 * 1024 // Limitar el tamaño del archivo a 5MB (ajusta esto según tus necesidades)  
    },  
    fileFilter: (req, file, cb) => {  
        // Aceptar solo ciertos tipos de archivos  
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];  
        
        if (allowedTypes.includes(file.mimetype)) {  
            cb(null, true); // Aceptar el archivo  
        } else {  
            cb(new Error('Tipo de archivo no permitido'), false); // Rechazar el archivo  
        }  
    }  
});  

// Exportar el middleware como una función  
module.exports = upload; // Exporta el objeto `upload` completo
