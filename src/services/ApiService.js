import axios from "axios";
import { APPCONFIG } from "../config/AppConfig";
import LocalStorageService from "./LocalStorageService";
// get call
function _getData(url, token) {
    const updatedUrl = APPCONFIG.HOST + url;
    this.headers.Authorization = `Bearer ${token}`;
    this.headers.clientId = 'aphcor';
    return axios.get(updatedUrl, { headers: this.headers });
}

function _postData(url,body){
    const updatedUrl = APPCONFIG.HOST + url;
    this.headers.Authorization = `Bearer ${LocalStorageService.getUserInfo("userInfo")?.access_token}`;
    return axios.post(updatedUrl,body,{ headers: this.headers })
}

function _putData(url,id,body){
    const updatedUrl = APPCONFIG.HOST + url +"/" + id;
    this.headers.Authorization = `Bearer ${LocalStorageService.getUserInfo("userInfo")?.access_token}`;
    return axios.put(updatedUrl,body,{ headers: this.headers })
}

function _deleteData(url,id){
    const updatedUrl = APPCONFIG.HOST + url +"/" + id;
    this.headers.Authorization = `Bearer ${LocalStorageService.getUserInfo("userInfo")?.access_token}`;
    return axios.delete(updatedUrl,{ headers: this.headers })
    
}

function _getDataById(url,id){
    const updatedUrl = APPCONFIG.HOST + url +"/" + id;
    this.headers.Authorization = `Bearer ${LocalStorageService.getUserInfo("userInfo")?.access_token}`;
    this.headers.clientId = 'aphcor';
    return axios.get(updatedUrl,{ headers: this.headers })
}
function _putUserStatus(url,id,status){
    const updatedUrl = APPCONFIG.HOST + url + "/" + id + "/" +status;
    this.headers.Authorization = `Bearer ${LocalStorageService.getUserInfo("userInfo")?.access_token}`;
    return axios.put(updatedUrl, {},{ headers: this.headers })
}


export const ApiService = {
    headers: { Authorization: "" },
    getData: _getData,
    postData:_postData,
    putData:_putData,
    deleteData:_deleteData,
    getDataById:_getDataById,
    putUserStatus:_putUserStatus

}
export default ApiService;