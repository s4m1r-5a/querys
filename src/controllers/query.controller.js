const moment = require('moment');
const { documentQuery, companyQuery } = require('../utils/queries');
const { getUsurys, createUsury, getUsurysBySearch } = require('../repositories/usurys.repository');
const { getPerson, getPersons, createPerson } = require('../repositories/persons.repository');
const { getEntity, createEntity, updateEntity } = require('../repositories/entities.repository');
const { entityQuery } = require('../services/entitiesQueryApi');
const { checkUsuryRate } = require('../services/servicesQueryApi');

const type = new Map();
type.set('CC', '1');
type.set('NIT', '2');
type.set('CE', '4');
type.set('PEP', '5');

moment.locale('es');

module.exports.entity = async (req, res) => {
  try {
    const { docType, docNumber } = req.body;
    const updated = req.body?.updated;

    if (!docType || !docNumber)
      return res.status(400).json({ success: false, message: 'Se requiere tipo y número de documento' });

    // Verificar si ya existe la persona
    const entity = await getEntity(docType, docNumber);
    if (entity && !updated) return res.json(entity);

    // Validar tipo de documento
    if (!type.has(docType)) return res.status(400).json({ success: false, message: 'Tipo de documento no válido' });

    try {
      const data = await entityQuery(type.get(docType), docNumber);

      if (data?.docType && updated && entity) {
        const updatedEntity = await updateEntity(entity.id, data);
        return res.json(updatedEntity.toJSON());
      } else if (data && data?.docType) {
        const savedEntity = await createEntity(data);
        return res.json(savedEntity.toJSON());
      } else throw new Error(data.message || 'No se pudieron obtener los datos');
    } catch (error) {
      console.error('Error en consulta de documento:', error);
      return res.status(500).json({ success: false, message: error.message || 'Error al consultar el documento' });
    }
  } catch (error) {
    console.error('Error general:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports.person = async (req, res) => {
  try {
    const { docType, docNumber } = req.body;

    if (!docType || !docNumber) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere tipo y número de documento'
      });
    }

    // Verificar si ya existe la persona
    const person = null; //await getPerson(docType, docNumber);
    if (person) return res.json(person);

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
        console.log('Guardando persona en la base de datos...');
        const savedPerson = await createPerson({
          docType: data.docType, // Esto ya debería ser CC, CE, etc.
          docNumber: data.docNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: data.fullName,
          arrayName: data.arrayName,
          Antecedentes: data.records
        });

        return res.json(await getPerson(data.docType, data.docNumber));
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

module.exports.company = async (req, res) => {
  try {
    const { nit, method } = req.body;

    if (!nit) {
      return res.status(400).json({
        success: false,
        message: 'NIT es requerido'
      });
    }

    const newBusiness = await companyQuery(nit, method);

    if (!newBusiness) {
      return res.status(404).json({
        success: false,
        message: `No se encontraron resultados para el NIT ${nit}`
      });
    }

    newBusiness.nit = nit;
    newBusiness.actualizado = newBusiness.actualizado ? moment(newBusiness.actualizado).format('YYYY-MM-DD') : null;
    newBusiness.date = newBusiness.date ? moment(newBusiness.date).format('YYYY-MM-DD') : null;

    if (Array.isArray(newBusiness.representantes)) {
      for (let i = 0; i < newBusiness.representantes.length; i++) {
        const person = newBusiness.representantes[i];
        try {
          const createdPerson = await createPerson(person);
          if (!i) newBusiness.agent = createdPerson.id || false;
          else if (!newBusiness.agent) {
            newBusiness.agent = createdPerson.id;
          }
        } catch (personError) {
          console.error(`Error creando representante ${i}:`, personError);
        }
      }
    }

    res.json({
      success: true,
      data: newBusiness
    });
  } catch (error) {
    console.error('Error en consulta de empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al consultar la empresa'
    });
  }
};

module.exports.usury = async (req, res) => {
  const { date } = req.body;
  if (!date) return res.json(await getUsurys());
  const month = moment(date).startOf('month').format('YYYY-MM-DD');
  const currentDate = moment().startOf('month').format('YYYY-MM-DD');
  const diff = moment().diff(month, 'months');
  let rate;

  if (diff > 12) rate = await getUsurysBySearch({ date: month });
  else {
    rate = await getUsurysBySearch({ date: currentDate });
    if (!rate) {
      const data = await checkUsuryRate(month);
      const { usury, created } = await createUsury(data);
      rate = data;
    }
  }
  res.json(rate ? rate : false);
};

//module.exports = type;
