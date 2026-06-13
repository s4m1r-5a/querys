const {
  normalizeDocType,
  normalizeDocument,
  calculateVerificationDigit
} = require('./common');

describe('document helpers', () => {
  const ccDocuments = [
    '73182574',
    '1082926704',
    '1082926579',
    '1015401040',
    '73575558',
    '45536418',
    '8850577',
    '1047405714',
    '64704440',
    '11090012'
  ];

  test('normalizes supported document types', () => {
    expect(normalizeDocType('cc')).toBe('CC');
    expect(normalizeDocType(' nit ')).toBe('NIT');
  });

  test('normalizes CC documents from screenshot fixtures', () => {
    ccDocuments.forEach(docNumber => {
      expect(normalizeDocument(docNumber, 'CC')).toBe(docNumber);
    });
  });

  test('removes separators from CC documents', () => {
    expect(normalizeDocument(' 1.082.926.704 ', 'CC')).toBe('1082926704');
  });

  test('removes NIT verification digit when it is included', () => {
    expect(normalizeDocument('900.123.456-8', 'NIT')).toBe('900123456');
  });

  test('calculates Colombian NIT verification digit', () => {
    expect(calculateVerificationDigit('900304238')).toBe(6);
    expect(calculateVerificationDigit('901626166')).toBe(1);
    expect(calculateVerificationDigit('901600406')).toBe(1);
    expect(calculateVerificationDigit('900682258')).toBe(3);
    expect(calculateVerificationDigit('901638010')).toBe(1);
  });

  test('calculates NIT verification digit with frontend-compatible formatting', () => {
    expect(calculateVerificationDigit(' 900 304 238 ')).toBe(6);
    expect(calculateVerificationDigit('901-600-406')).toBe(1);
  });
});
