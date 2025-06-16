import DicomObjectWithIdAbstract from './objectWithId';

const FIELD_STUDY_DATE = 'studyDate';
const FIELD_STUDY_TIME = 'studyTime';
const FIELD_ACCESSION_NUMBER = 'accessionNumber';
const FIELD_INSTANCE_AVAILABILITY = 'instanceAvailability';
const FIELD_MODALITIES_IN_STUDY = 'modalitiesInStudy';
const FIELD_INSTITUTION_NAME = 'InstitutionName';
const FIELD_REFERRING_PHYSICIAN_NAME = 'referringPhysicianName';
const FIELD_TIMEZONE_OFFSET_FROM_UTC = 'timezoneOffsetFromUTC';
const FIELD_RETRIEVE_URL = 'retrieveURL';
const FIELD_PATIENT_NAME = 'patientName';
const FIELD_PATIENT_ID = 'patientID';
const FIELD_PATIENT_BIRTH_DATE = 'patientBirthDate';
const FIELD_PATIENT_SEX = 'patientSex';
const FIELD_STUDY_INSTANCE_UID = 'studyInstanceUID';
const FIELD_STUDY_ID = 'studyID';
const FIELD_NUMBER_OF_STUDY_RELATED_SERIES = 'numberOfStudyRelatedSeries';
const FIELD_NUMBER_OF_STUDY_RELATED_INSTANCES = 'numberOfStudyRelatedInstances';
const FIELD_DESCRIPTION = 'description';

class Study extends DicomObjectWithIdAbstract {
  constructor(data) {
    super(data);
    const fields = [
      FIELD_STUDY_DATE,
      FIELD_STUDY_TIME,
      FIELD_ACCESSION_NUMBER,
      FIELD_INSTANCE_AVAILABILITY,
      FIELD_MODALITIES_IN_STUDY,
      FIELD_INSTITUTION_NAME,
      FIELD_REFERRING_PHYSICIAN_NAME,
      FIELD_TIMEZONE_OFFSET_FROM_UTC,
      FIELD_RETRIEVE_URL,
      FIELD_PATIENT_NAME,
      FIELD_PATIENT_ID,
      FIELD_PATIENT_BIRTH_DATE,
      FIELD_PATIENT_SEX,
      FIELD_STUDY_INSTANCE_UID,
      FIELD_STUDY_ID,
      FIELD_NUMBER_OF_STUDY_RELATED_SERIES,
      FIELD_NUMBER_OF_STUDY_RELATED_INSTANCES,
      FIELD_DESCRIPTION,
    ];
    fields.forEach(field => {            
      this[field] = this.parseAttribute(data?.[Study.getFieldAttribute(field)]);
    });
  }

  static getObjectIdField() {
    return FIELD_STUDY_INSTANCE_UID;
  }

  static getFieldAttribute(field) {
    switch (field) {
      case FIELD_STUDY_DATE:
        return '00080020';
      case FIELD_STUDY_TIME:
        return '00080030';
      case FIELD_ACCESSION_NUMBER:
        return '00080050';
      case FIELD_INSTANCE_AVAILABILITY:
        return '00080056';
      case FIELD_MODALITIES_IN_STUDY:
        return '00080061';
      case FIELD_INSTITUTION_NAME:
        return '00080080';
      case FIELD_REFERRING_PHYSICIAN_NAME:
        return '00080090';
      case FIELD_TIMEZONE_OFFSET_FROM_UTC:
        return '00080201';
      case FIELD_RETRIEVE_URL:
        return '00081190';
      case FIELD_PATIENT_NAME:
        return '00100010';
      case FIELD_PATIENT_ID:
        return '00100020';
      case FIELD_PATIENT_BIRTH_DATE:
        return '00100030';
      case FIELD_PATIENT_SEX:
        return '00100040';
      case FIELD_STUDY_INSTANCE_UID:
        return '0020000D';
      case FIELD_STUDY_ID:
        return '00200010';
      case FIELD_NUMBER_OF_STUDY_RELATED_SERIES:
        return '00201206';
      case FIELD_NUMBER_OF_STUDY_RELATED_INSTANCES:
        return '00201208';
      case FIELD_DESCRIPTION:
          return '00081030';
      default:
        throw new Error(`[Study] Unmapped field: ${field}`);
    }
  }
}

export default Study;

export {
  FIELD_STUDY_DATE,
  FIELD_STUDY_TIME,
  FIELD_ACCESSION_NUMBER,
  FIELD_INSTANCE_AVAILABILITY,
  FIELD_MODALITIES_IN_STUDY,
  FIELD_INSTITUTION_NAME,
  FIELD_REFERRING_PHYSICIAN_NAME,
  FIELD_TIMEZONE_OFFSET_FROM_UTC,
  FIELD_RETRIEVE_URL,
  FIELD_PATIENT_NAME,
  FIELD_PATIENT_ID,
  FIELD_PATIENT_BIRTH_DATE,
  FIELD_PATIENT_SEX,
  FIELD_STUDY_INSTANCE_UID,
  FIELD_STUDY_ID,
  FIELD_NUMBER_OF_STUDY_RELATED_SERIES,
  FIELD_NUMBER_OF_STUDY_RELATED_INSTANCES,
  FIELD_DESCRIPTION,
};
