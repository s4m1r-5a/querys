module.exports = {
  procuraduria: {
    url: 'https://www.procuraduria.gov.co/Pages/Consulta-de-Antecedentes.aspx',
    frameUrlIncludes: 'webcert/Certificado.aspx',
    docTypeSelect: '#ddlTipoID',
    docNumberInput: '#txtNumID',
    questionLabel: '#lblPregunta',
    answerInput: '#txtRespuestaPregunta',
    changeQuestionButton: '#ImageButton1',
    submitButton: '#btnConsultar',
    resultContainer: '#divSec',
    validationSummary: '#ValidationSummary1',
    names: '#divSec > div.datosConsultado > span',
    noRecords: '#divSec > h2:nth-child(3)',
    recordsHeader: '#divSec > div.SeccionAnt h2',
    recordsRows: '#divSec > div.SeccionAnt > div.SessionNumSiri > h2, h3, tr',
    recordsFallbackRows: '#divSec > div.SeccionAnt > table > tbody > tr'
  },
  rues: {
    url: 'https://www.rues.org.co',
    searchInput: '#search',
    searchButton: '#btn-busqueda',
    includeCancelledCheckbox: '#chk_cancelada',
    filteredSearchButton: 'form.filtro__inside button[type="submit"]',
    resultCard: '.card-result',
    noResults: '.alert-info',
    generalTab: '#detail-tabs-tabpane-pestana_general',
    registryRows: '.registroapi',
    registryLabel: '.registroapi__etiqueta',
    registryValue: '.registroapi__valor',
    title: 'h1.intro__nombre',
    economicTab: '#detail-tabs-tabpane-pestana_economica'
  }
};
