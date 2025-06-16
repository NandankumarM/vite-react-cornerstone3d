import Study from './study';
import Series from './series';
import Instance from './instance';

class DicomObjectParser {
  parseStudy(data) {
    return new Study(data);
  }

  parseSeries(data) {
    return new Series(data);
  }

  parseInstance(data) {
    return new Instance(data);
  }

  parse(objectType, data) {
    // eslint-disable-next-line new-cap
    return new objectType(data);
  }
}

const parser = new DicomObjectParser();
export default parser;
