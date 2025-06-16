import DicomObjectAbstract from './object';

class DicomObjectWithIdAbstract extends DicomObjectAbstract {
  /**
   * @return string
   */
  static getObjectIdField() {
    throw new Error('Should return field');
  }
}

export default DicomObjectWithIdAbstract;
