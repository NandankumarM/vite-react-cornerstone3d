import Instance from '../parser/instance';
import Study from '../parser/study';
import Series from '../parser/series';
import params from '../../../params';

class ImageHelper {
  /**
   * @param {Instance} instance
   * @return {string}
   */
  buildImageUrl(instance) {
    const instanceId = instance[Instance.getObjectIdField()];
    const studyId = instance[Study.getObjectIdField()];
    const seriesId = instance[Series.getObjectIdField()];

    return `wadouri:${
      params.backendUrl
    }/dicomweb/wado-uri?objectUID=${instanceId}&studyUID=${studyId}&seriesUID=${seriesId}&requestType=WADO&contentType=application%2Fdicom`;
  }
}

const imageHelper = new ImageHelper();
export default imageHelper;
