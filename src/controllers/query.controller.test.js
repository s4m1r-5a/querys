const { ChallengeRequiredError } = require('../utils/challengeStore');

jest.mock('../repositories/entities.repository', () => ({
  getEntity: jest.fn(),
  createEntity: jest.fn(entity => ({ ...entity, id: 1 })),
  updateEntity: jest.fn((id, entity) => ({ ...entity, id }))
}));

jest.mock('../repositories/usurys.repository', () => ({
  getUsurys: jest.fn(() => []),
  createUsury: jest.fn(data => ({ usury: data, created: true })),
  getUsurysBySearch: jest.fn(() => null)
}));

jest.mock('../services/servicesQueryApi', () => ({
  checkUsuryRate: jest.fn(() => ({ annualRate: 25.5, date: '2026-01-01' }))
}));

jest.mock('../utils/queries', () => ({
  documentQuery: jest.fn(),
  companyQuery: jest.fn(),
  answerDocumentChallenge: jest.fn()
}));

const entityRepository = require('../repositories/entities.repository');
const queryUtils = require('../utils/queries');
const controller = require('./query.controller');

const createResponse = () => {
  const res = {
    statusCode: 200,
    body: null,
    status: jest.fn(code => {
      res.statusCode = code;
      return res;
    }),
    json: jest.fn(body => {
      res.body = body;
      return res;
    })
  };

  return res;
};

describe('query controller', () => {
  const nitFixtures = [
    {
      docNumber: '900304238',
      verifyDigit: '6',
      fullName: 'FUNDACION DEPORTIVA CONDOR - EN LIQUIDACION'
    },
    {
      docNumber: '901626166',
      verifyDigit: '1',
      fullName: 'DEMILES GROUP S.A.S'
    },
    {
      docNumber: '901600406',
      verifyDigit: '1',
      fullName: 'PROMOTORA GRECIA SAS'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    entityRepository.getEntity.mockResolvedValue(null);
  });

  test('requires personal data treatment acceptance for document queries', async () => {
    const req = {
      body: {
        docType: 'CC',
        docNumber: '1082926704'
      }
    };
    const res = createResponse();

    await controller.document(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body.success).toBe(false);
    expect(queryUtils.documentQuery).not.toHaveBeenCalled();
  });

  test('returns 409 when document query requires a client challenge', async () => {
    const challenge = {
      sessionId: 'abc',
      question: 'Pregunta desconocida 5',
      attempts: 5,
      expiresAt: '2026-01-01T00:00:00.000Z'
    };
    queryUtils.documentQuery.mockResolvedValue(new ChallengeRequiredError(challenge));

    const req = {
      body: {
        docType: 'CC',
        docNumber: '1082926704',
        acceptedPersonalDataTreatment: true
      }
    };
    const res = createResponse();

    await controller.document(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.body).toEqual({
      success: false,
      code: 'CHALLENGE_REQUIRED',
      challenge
    });
  });

  test('stores successful document query result', async () => {
    queryUtils.documentQuery.mockResolvedValue({
      personType: 'NATURAL',
      docType: 'CC',
      docNumber: '1082926704',
      fullName: 'SAMYR DE JESUS SALDARRIAGA ATENCIO'
    });

    const req = {
      body: {
        docType: 'CC',
        docNumber: '1.082.926.704',
        acceptedPersonalDataTreatment: true
      }
    };
    const res = createResponse();

    await controller.document(req, res);

    expect(queryUtils.documentQuery).toHaveBeenCalledWith('CC', '1082926704');
    expect(entityRepository.createEntity).toHaveBeenCalledWith(
      expect.objectContaining({
        docType: 'CC',
        docNumber: '1082926704'
      })
    );
    expect(res.body.success).toBe(true);
  });

  test.each(nitFixtures)('stores NIT fixture $docNumber from company alias', async fixture => {
    queryUtils.companyQuery.mockResolvedValue({
      personType: 'JURIDICA',
      docType: 'NIT',
      docNumber: fixture.docNumber,
      verifyDigit: fixture.verifyDigit,
      fullName: fixture.fullName
    });

    const req = {
      body: {
        nit: `${fixture.docNumber}-${fixture.verifyDigit}`,
        acceptedPersonalDataTreatment: true
      }
    };
    const res = createResponse();

    await controller.company(req, res);

    expect(queryUtils.companyQuery).toHaveBeenCalledWith(fixture.docNumber);
    expect(entityRepository.createEntity).toHaveBeenCalledWith(
      expect.objectContaining({
        docType: 'NIT',
        docNumber: fixture.docNumber,
        verifyDigit: fixture.verifyDigit,
        fullName: fixture.fullName
      })
    );
    expect(res.body.success).toBe(true);
  });

  test('continues a document challenge and stores the result', async () => {
    queryUtils.answerDocumentChallenge.mockResolvedValue({
      personType: 'NATURAL',
      docType: 'CC',
      docNumber: '1082926704',
      fullName: 'SAMYR DE JESUS SALDARRIAGA ATENCIO'
    });

    const req = {
      body: {
        sessionId: 'challenge-id',
        answer: 'Bogota'
      }
    };
    const res = createResponse();

    await controller.answerDocumentChallenge(req, res);

    expect(queryUtils.answerDocumentChallenge).toHaveBeenCalledWith('challenge-id', 'Bogota');
    expect(entityRepository.createEntity).toHaveBeenCalledWith(
      expect.objectContaining({
        docType: 'CC',
        docNumber: '1082926704'
      })
    );
    expect(res.body.success).toBe(true);
  });
});
