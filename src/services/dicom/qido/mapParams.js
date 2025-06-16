/**
 * QIDO - Query based on ID for DICOM Objects
 * search for studies, series and instances by patient ID, and receive their
 * unique identifiers for further usage.
 *
 * Quick: https://www.dicomstandard.org/dicomweb/query-qido-rs/
 * Standard: http://dicom.nema.org/medical/dicom/current/output/html/part18.html#sect_10.6
 *
 * Routes:
 * ==========
 * /studies?
 * /studies/{studyInstanceUid}/series?
 * /studies/{studyInstanceUid}/series/{seriesInstanceUid}/instances?
 *
 * Query Parameters:
 * ================
 * | KEY              | VALUE              |
 * |------------------|--------------------|
 * | {attributeId}    | {value}            |
 * | includeField     | {attribute} or all |
 * | fuzzymatching    | true OR false      |
 * | limit            | {number}           |
 * | offset           | {number}           |
 */

/**
 * Produces a QIDO URL given server details and a set of specified search filter
 * items
 *
 * @param filter
 * @param serverSupportsQIDOIncludeField
 * @returns {string} The URL with encoded filter query data
 */
// https://d33do7qe4w26qo.cloudfront.net/dicomweb/studies?PatientName=*ac*&limit=101&offset=0&fuzzymatching=false&includefield=00081030%2C00080060

function mapParams(params, options = {}) {
  if (!params) {
    return;
  }
  const commaSeparatedFields = [
    "00081030", // Study Description
    "00080060", // Modality
    // Add more fields here if you want them in the result
  ].join(",");

  const { supportsWildcard } = options;
  const withWildcard = (value) => {
    return supportsWildcard && value ? `${value}` : value;
  };

  const parameters = {
    // Named
    PatientName: withWildcard(params.patientName),
    // '00100010': withWildcard(params.patientName),
    // PatientID: withWildcard(params.patientId),
    "00100020": withWildcard(params.patientId), // Temporarily to make the tests pass with dicomweb-server.. Apparently it's broken?
    // AccessionNumber: withWildcard(params.accessionNumber),
    // StudyDescription: withWildcard(params.studyDescription),
    ModalitiesInStudy: params.modalitiesInStudy,
    // Other
    limit: params.limit || 101,
    offset: params.offset || 0,
    fuzzymatching: options.supportsFuzzyMatching === true,
    includefield: commaSeparatedFields, // serverSupportsQIDOIncludeField ? commaSeparatedFields : 'all',
  };

  // build the StudyDate range parameter
  if (params.startDate && params.endDate) {
    parameters.StudyDate = `${JSON.stringify(
      params.startDate
    )}-${JSON.stringify(params.endDate)}`;
  } else if (params.startDate) {
    const today = new Date();
    const DD = String(today.getDate()).padStart(2, "0");
    const MM = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const YYYY = today.getFullYear();
    const todayStr = `${YYYY}${MM}${DD}`;

    parameters.StudyDate = `${JSON.stringify(
      params.startDate
    )}-${JSON.stringify(todayStr)}`;
  } else if (params.endDate) {
    const oldDateStr = `19700102`;
    parameters.StudyDate = `${oldDateStr}-${params.endDate}`;
  }

  // Build the StudyInstanceUID parameter
  if (params.studyInstanceUid) {
    let studyUids = params.studyInstanceUid;
    studyUids = Array.isArray(studyUids) ? studyUids.join() : studyUids;
    studyUids = studyUids.replace(/[^0-9.]+/g, "\\");
    parameters.StudyInstanceUID = studyUids;
  }

  // Clean query params of undefined values.
  const final = {};
  Object.keys(parameters).forEach((key) => {
    if (parameters[key] !== undefined && parameters[key] !== "") {
      final[key] = parameters[key];
    }
  });

  return final;
}

export default mapParams;
