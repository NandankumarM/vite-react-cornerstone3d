import config from '../params';
import request from '../utils/request';

class ApiManager {
  loadSummaryData() {
    const url = `${config.backendUrl}/api/summary`;
    return request(url, {
      method: 'GET',
    });
  }

  loadToolsData(instanceUID) {
    const url = `${config.backendUrl}/api/instance/${instanceUID}/tools`;
    return request(url, {
      method: 'GET',
    });
  }

  updateToolsData(instanceUID, toolsData) {
    const url = `${config.backendUrl}/api/instance/${instanceUID}/tools`;
    return request(url, {
      method: 'PUT',
      body: JSON.stringify(toolsData),
    });
  }
}

const apiManager = new ApiManager();
export default apiManager;
