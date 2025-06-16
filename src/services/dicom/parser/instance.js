import Series from './series';
import Study from './study';
import DicomObjectWithIdAbstract from './objectWithId';

const FIELD_SOP_CLASS_UID = 'SOPClassUID';
const FIELD_SOP_INSTANCE_UID = 'SOPInstanceUID';
const FIELD_INSTANCE_NUMBER = 'instanceNumber';

class Instance extends DicomObjectWithIdAbstract {
  constructor(data) {
    super(data);
    const fields = [
      Study.getObjectIdField(),
      Series.getObjectIdField(),
      FIELD_SOP_CLASS_UID,
      FIELD_SOP_INSTANCE_UID,
      FIELD_INSTANCE_NUMBER,
    ];
    fields.forEach(field => {
      this[field] = this.parseAttribute(
        data?.[Instance.getFieldAttribute(field)],
      );
    });
  }

  static getObjectIdField() {
    return FIELD_SOP_INSTANCE_UID;
  }

  static getFieldAttribute(field) {
    switch (field) {
      case FIELD_SOP_CLASS_UID:
        return '00080016';
      case FIELD_SOP_INSTANCE_UID:
        return '00080018';
      case FIELD_INSTANCE_NUMBER:
        return '00200013';
      case Study.getObjectIdField():
        return Study.getFieldAttribute(Study.getObjectIdField());
      case Series.getObjectIdField():
        return Series.getFieldAttribute(Series.getObjectIdField());
      default:
        throw new Error(`[Instance] Unmapped field: ${field}`);
    }
  }
}

export default Instance;

export { FIELD_SOP_CLASS_UID, FIELD_SOP_INSTANCE_UID, FIELD_INSTANCE_NUMBER };
