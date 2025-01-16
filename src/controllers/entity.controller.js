const moment = require('moment');
const {
  getEntity,
  getEntities,
  createEntity
} = require('../repositories/entities.repository');
const { businessQuery } = require('../services/enterpriseQueryApi');

const type = new Map();
type.set('CC', '1');
type.set('CE', '4');
type.set('PEP', '5');

moment.locale('es');

module.exports.entity = async (req, res) => {
  try {
    const { docType, docNumber } = req.body;
    
    if (!docType || !docNumber) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere tipo y número de documento'
      });
    }

    // Verificar si ya existe la entidad
    const entity = await getEntity(docType, docNumber);
    if (entity) return res.json(entity);

    // Validar tipo de documento
    if (!type.has(docType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento no válido'
      });
    }

    try {
      console.log('Consultando documento con tipo:', docType, 'número:', docNumber);
      const data = await documentQuery(type.get(docType), docNumber);
      console.log('Datos recibidos de documentQuery:', data);
      
      if (data && data.success) {
        console.log('Guardando entidad en la base de datos...');
        const savedEntity = await createEntity({
          docType: data.docType,  // Esto ya debería ser CC, CE, etc.
          docNumber: data.docNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: data.fullName,
          arrayName: data.arrayName,
          Antecedentes: data.records
        });
        
        return res.json(await getEntity(data.docType, data.docNumber));
      } else {
        throw new Error(data.message || 'No se pudieron obtener los datos');
      }
    } catch (error) {
      console.error('Error en consulta de documento:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar el documento'
      });
    }
  } catch (error) {
    console.error('Error general:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};


//module.exports = type;
