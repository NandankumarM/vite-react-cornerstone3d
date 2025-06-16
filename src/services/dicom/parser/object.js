class DicomObjectAbstract {
  #raw;

  constructor(data) {
    if (new.target === DicomObjectAbstract) {
      throw new TypeError('Cannot construct Abstract instances directly');
    }
    this.#raw = data;
  }

  parseAttribute(attribute) {
    if (!attribute) {
      return null;
    }

    const VR = attribute.vr;
    const value = attribute.Value;

    if( VR === undefined)
    {
      return value;
    }

    if (!Array.isArray(value) || !value.length > 0) {
      return null;
    }

    if (typeof VR !== 'string') {
      throw new Error('Wrong attribute VR');
    }
    const base64VRs = ['OB', 'OD', 'OF', 'OL', 'OV', 'OW', 'UN'];

    const returnValue = [];

    if (VR === 'PN') {
      value.forEach(valueContainer => {
        if (typeof valueContainer.Alphabetic === 'string') {
          returnValue.push(valueContainer.Alphabetic);
        }
        if (typeof valueContainer.Ideographic === 'string') {
          returnValue.push(valueContainer.Ideographic);
        }
        if (typeof valueContainer.Phonetic === 'string') {
          returnValue.push(valueContainer.Phonetic);
        }
      });
    } else if (base64VRs.includes(VR)) {
      value.forEach(v => returnValue.push(atob(v)));
    } else {
      value.forEach(v => returnValue.push(v));
    }

    if (returnValue.length === 0) {
      return null;
    }
    if (returnValue.length === 1) {
      return returnValue[0];
    }
    return returnValue;
  }
}

export default DicomObjectAbstract;
