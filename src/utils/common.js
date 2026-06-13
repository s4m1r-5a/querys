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
  // Factores en orden correcto, aplicados de derecha a izquierda.
  const factors = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

  // Convertir el NIT a string para evitar problemas con números grandes
  const nitStr = String(nit).trim().replace(/[-\s]/g, '');

  // Validar que el NIT contenga solo números
  if (!/^\d+$/.test(nitStr)) {
    throw new Error('El NIT debe contener solo números.');
  }

  // NITs colombianos tipicamente tienen entre 8 y 10 digitos.
  if (nitStr.length < 8 || nitStr.length > 10) {
    console.warn(`NIT con longitud inusual: ${nitStr.length} digitos`);
  }

  let sum = 0;

  // Iterar sobre cada digito del NIT de derecha a izquierda.
  for (let i = 0; i < nitStr.length; i++) {
    const digit = parseInt(nitStr[nitStr.length - 1 - i], 10);
    const factor = factors[i % factors.length];
    sum += digit * factor;
  }

  // Calcular el residuo de la suma módulo 11
  const remainder = sum % 11;

  // Determinar el dígito de verificación según las reglas del módulo 11
  const verificationDigit = remainder <= 1 ? remainder : 11 - remainder;

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
