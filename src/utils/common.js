/**
 * Calcula el dígito de verificación para un NIT colombiano según la normativa vigente.
 *
 * @param {string} nit - Número de Identificación Tributaria sin el dígito de verificación
 * @returns {number} Dígito de verificación calculado
 * @description
 * Este método implementa el algoritmo oficial para calcular el dígito de verificación de un NIT.
 * Sigue las especificaciones de la DIAN para validar la estructura del número de identificación.
 *
 * Pasos del algoritmo:
 * 1. Multiplica cada dígito por un factor predefinido
 * 2. Suma los resultados de las multiplicaciones
 * 3. Calcula el módulo 11
 * 4. Determina el dígito de verificación según reglas específicas
 */
module.exports.calculateVerificationDigit = nit => {
  // Factores predefinidos por la DIAN
  const factors = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];

  // Convertir el NIT a string para evitar problemas con números grandes
  const nitStr = String(nit);

  // Validar que el NIT contenga solo números
  if (!/^\d+$/.test(nitStr)) {
    throw new Error('The NIT must contain only numbers.');
  }

  let sum = 0;
  const startFactorIndex = factors.length - nitStr.length;

  for (let i = 0; i < nitStr.length; i++) {
    const digit = parseInt(nitStr[i], 10);
    const factor = factors[startFactorIndex + i] || 0;
    sum += digit * factor;
  }

  // Calcular el residuo de la suma módulo 11
  const remainder = sum % 11;

  // Determinar el dígito de verificación según las reglas del módulo 11
  const verificationDigit = remainder > 1 ? 11 - remainder : remainder;

  return verificationDigit;
};

const DOCUMENT_TYPES = new Set(['CC', 'CE', 'PEP', 'NIT']);

module.exports.normalizeDocType = docType => {
  const normalizedType = String(docType || '').trim().toUpperCase();

  if (!DOCUMENT_TYPES.has(normalizedType)) {
    throw new Error('Tipo de documento no valido');
  }

  return normalizedType;
};

module.exports.normalizeDocument = (docNumber, docType) => {
  const rawDocument = String(docNumber || '').trim();
  const onlyDigits = rawDocument.replace(/\D/g, '');

  if (!onlyDigits) throw new Error('Numero de documento no valido');

  if (docType === 'NIT' && onlyDigits.length > 9) {
    return onlyDigits.slice(0, -1);
  }

  return onlyDigits;
};

module.exports.formatEntityResponse = entity => {
  if (!entity) return null;
  if (typeof entity.toJSON === 'function') return entity.toJSON();
  return entity;
};
