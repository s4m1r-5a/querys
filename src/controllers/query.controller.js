const moment = require('moment');
const {
  documentQuery,
  companyQuery,
  answerDocumentChallenge
} = require('../utils/queries');
const {
  getUsurys,
  createUsury,
  getUsurysBySearch
} = require('../repositories/usurys.repository');
const {
  getEntity,
  createEntity,
  updateEntity
} = require('../repositories/entities.repository');
const { checkUsuryRate } = require('../services/servicesQueryApi');
const {
  normalizeDocument,
  normalizeDocType,
  formatEntityResponse
} = require('../utils/common');
const {
  ChallengeRequiredError,
  ChallengeExpiredError
} = require('../utils/challengeStore');

moment.locale('es');

const queryDocument = async ({ docType, docNumber, updated = false }) => {
  const normalizedType = normalizeDocType(docType);
  const normalizedNumber = normalizeDocument(docNumber, normalizedType);

  const cachedEntity = await getEntity(normalizedType, normalizedNumber);
  if (cachedEntity && !updated) return cachedEntity;

  const data =
    normalizedType === 'NIT'
      ? await companyQuery(normalizedNumber)
      : await documentQuery(normalizedType, normalizedNumber);

  if (data instanceof ChallengeRequiredError) throw data;

  if (!data || data.success === false || !data.docType || !data.docNumber) {
    throw new Error(data?.message || 'No se pudieron obtener los datos');
  }

  if (cachedEntity) return updateEntity(cachedEntity.id, data);
  return createEntity(data);
};

module.exports.document = async (req, res) => {
  try {
    const { docType, docNumber, updated, acceptedPersonalDataTreatment } = req.body;

    if (!docType || !docNumber) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere tipo y numero de documento'
      });
    }

    if (!acceptedPersonalDataTreatment) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere aceptar el tratamiento de datos personales'
      });
    }

    const entity = await queryDocument({ docType, docNumber, updated });

    return res.json({
      success: true,
      data: formatEntityResponse(entity)
    });
  } catch (error) {
    if (error instanceof ChallengeRequiredError) {
      return res.status(409).json({
        success: false,
        code: error.code,
        challenge: error.challenge
      });
    }

    const status = /no valido|required|requiere/i.test(error.message) ? 400 : 500;
    if (status >= 500) console.error('Error en consulta de documento:', error);

    return res.status(status).json({
      success: false,
      message: error.message || 'Error al consultar el documento'
    });
  }
};

module.exports.answerDocumentChallenge = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere sessionId y answer'
      });
    }

    const data = await answerDocumentChallenge(sessionId, answer);
    const cachedEntity = await getEntity(data.docType, data.docNumber);
    const entity = cachedEntity
      ? await updateEntity(cachedEntity.id, data)
      : await createEntity(data);

    return res.json({
      success: true,
      data: formatEntityResponse(entity)
    });
  } catch (error) {
    if (error instanceof ChallengeRequiredError) {
      return res.status(409).json({
        success: false,
        code: error.code,
        challenge: error.challenge
      });
    }

    if (error instanceof ChallengeExpiredError) {
      return res.status(410).json({
        success: false,
        code: error.code,
        message: error.message
      });
    }

    if (error.code === 'CHALLENGE_ANSWER_REJECTED') {
      return res.status(422).json({
        success: false,
        code: error.code,
        message: error.message
      });
    }

    console.error('Error resolviendo pregunta de documento:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al resolver la pregunta del documento'
    });
  }
};

module.exports.person = async (req, res) => {
  req.body.docType = req.body.docType || 'CC';
  return module.exports.document(req, res);
};

module.exports.company = async (req, res) => {
  req.body.docType = 'NIT';
  req.body.docNumber = req.body.docNumber || req.body.nit;
  return module.exports.document(req, res);
};

module.exports.usury = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.json({
        success: true,
        data: await getUsurys()
      });
    }

    const month = moment(date).startOf('month').format('YYYY-MM-DD');
    let rate = await getUsurysBySearch({ date: month });

    if (!rate) {
      const data = await checkUsuryRate(month);
      if (!data || typeof data === 'string' || data.error) {
        throw new Error(data?.error || data || 'No se pudo consultar la tasa de usura');
      }

      const created = await createUsury(data);
      rate = created.usury || data;
    }

    return res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Error en consulta de usura:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al consultar la tasa de usura'
    });
  }
};
