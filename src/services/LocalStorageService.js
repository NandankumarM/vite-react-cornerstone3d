
import moment from 'moment';
// import { logout } from '../appRedux/actions/User.Actions';
import { encryptJson, decryptJson, encryptFieldUsingAES, decryptFieldUsingAES } from './Encrypt.Decrypt.Service';

async function _setToken(prefix, tokenObj) {
    localStorage.setItem("TokenTime", moment().toString());
    localStorage.setItem(prefix, tokenObj);
}

async function _setDicomToken(dicomToken) {
    localStorage.setItem("dicomLoginSecret", dicomToken);
}

function _setHospitalDomain(data) {
    localStorage.setItem("Hospital Domain", data);
}

function _setPatientData(data) {
    let data1 = localStorage.getItem("Patient");
    let tmpData = data1 !== null || data1 !== undefined ? JSON.parse(data1) : {};
    tmpData = { ...tmpData, ...data }
    //  console.log(tmpData, "tmpData 1")
    localStorage.setItem("Patient", JSON.stringify(tmpData));
}

function _setProcedureData(procedureCode, categoryId, data, patientId = undefined) {
    let existData = localStorage.getItem("draft");
    existData = existData !== null ? JSON.parse(existData) : {}
    if (Object.keys(existData).length) {
        if (patientId === undefined) {
            if (existData[categoryId]) {
                existData[categoryId][procedureCode] = data
                // let tmpObj = {...existData[categoryId]}
                // console.log(tmpObj)
                // if(Object.keys(tmpObj).length){
                //     let filteredData = Object.keys(tmpObj).filter((index) => tmpObj[index] !== procedureCode)
                //     console.log(filteredData)
                // }
                // tmpObj[procedureCode] = data
                // existData[categoryId] = [...tmpObj]
            }
            else {
                existData[categoryId] = { [procedureCode]: data }
            }
        }
        else {
            if (existData[patientId]) {
                if (existData[patientId][categoryId]) {
                    existData[patientId][categoryId][procedureCode] = data
                    // let tmpObj = {...existData[categoryId]}
                    // console.log(tmpObj)
                    // if(Object.keys(tmpObj).length){
                    //     let filteredData = Object.keys(tmpObj).filter((index) => tmpObj[index] !== procedureCode)
                    //     console.log(filteredData)
                    // }
                    // tmpObj[procedureCode] = data
                    // existData[categoryId] = [...tmpObj]
                }
                else {
                    existData[patientId][categoryId] = { [procedureCode]: data }
                }
            }
            else {
                existData[patientId] = { [categoryId]: { [procedureCode]: data } }
            }
        }
    }
    else {
        // existData[categoryId][procedureCode] = dataS
        if (patientId === undefined) {
            existData = { [categoryId]: { [procedureCode]: data } }
        }
        else {
            existData = { [patientId]: { [categoryId]: { [procedureCode]: data } } }
        }
    }
    localStorage.setItem("draft", JSON.stringify(existData));
}


function _getPatientData() {
    let data = localStorage.getItem("Patient");
    let tmpData = data !== null || data !== undefined ? JSON.parse(data) : {};
    return tmpData;
}

function _getPatientHeaderData() {
    let data = localStorage.getItem("patientDataRtno");
    let tmpData = data !== null || data !== undefined ? JSON.parse(data) : {};
    return tmpData;
}

function _deletePatientHeaderData() {
    let data = localStorage.removeItem("patientDataRtno");
   
}

function _getProcedureData() {
    let data = localStorage.getItem("draft");
    let tmpData = data !== null || data !== undefined ? JSON.parse(data) : {};
    return tmpData;
}

function _deleteProcedureData(categoryId, patientId = undefined) {
    let data = localStorage.getItem("draft");
    let tmpData = data !== null && data !== undefined ? JSON.parse(data) : {};
    if (Object.keys(tmpData).length) {
        if (patientId === undefined && tmpData[categoryId]) {
            delete tmpData[categoryId]
        }
        else if (tmpData[patientId] && tmpData[patientId][categoryId]) {
            delete tmpData[patientId][categoryId]
        }
    }
    localStorage.setItem("draft", JSON.stringify(tmpData));
    // return  tmpData;
}

function _deletePatinetData(categoryId, patientId = undefined) {
    localStorage.setItem("Patient", "{}");
    // return  tmpData;
}

function _getFromTokenObj(prefix, part) {
    let tokenObj = localStorage.getItem(prefix);
    tokenObj = tokenObj ? decryptFieldUsingAES(tokenObj) : null;
    return tokenObj ? tokenObj[part] : null;
}

function _getHospitalDomain() {
    return localStorage.getItem("Hospital Domain");
}

function _getAccessToken(prefix) {
    let currentTime = localStorage.getItem("TokenTime")
    let validTime = moment(currentTime).add(12, "hours")
    if (moment().isBefore(validTime)) {
        return localStorage.getItem(prefix);
    }
    else {
        LocalStorageService.clear()
        // localStorage.removeItem("N_API");  
        // localStorage.removeItem("TokenTime");
    }
}
function _getRefreshToken(prefix) {
    return _getFromTokenObj(prefix, "refresh_token");
}
function _clearToken(prefix) {
    localStorage.removeItem(prefix);
}
function _clearAll() {
    localStorage.clear();
}
function _getExpiresIn(prefix = "") {
    return _getFromTokenObj(prefix, "expires_in");
}

function _setUserInfo(userInfo) {
    let { image, ...userDetails } = userInfo;
    localStorage.setItem("userInfo", encryptJson(userInfo));
}
function _setLicense(licInfo) {
    localStorage.setItem("licInfo", encryptJson(licInfo));
}

function _setPrivilege(privilegeInfo) {
    localStorage.setItem("privilegeInfo", encryptJson(privilegeInfo));
}

function _setLicenseStatus(licInfo) {
    localStorage.setItem("licStatus", licInfo);
}

function _setHospitalType(licInfo) {
    localStorage.setItem("hospitalType", licInfo);
}

function _setHospitalLimit(limit) {
    localStorage.setItem("hospitalLimit", limit);
}

function _setHospitalName(licInfo) {
    localStorage.setItem("hospitalName", licInfo);
}

function _setGlobalSetting(globalsetting) {
    localStorage.setItem("globalSetting", JSON.stringify(globalsetting));
}

function _setLoader(loaderState) {
    localStorage.setItem("loader", loaderState);
}

function _setdepartmentDisplay(departmentDisplay) {
    localStorage.setItem("departmentDisplay", departmentDisplay);
}

function _getdepartmentDisplay() {
    let departmentDisplay = localStorage.getItem("departmentDisplay");
    return departmentDisplay;
}

function _getLoader() {
    let loader = localStorage.getItem("loader");
    return loader;
}

function _getUserInfo() {
    let userInfo = localStorage.getItem("userInfo");
    return userInfo ? decryptJson(userInfo) : null;
}

function _getLicense() {
    let licInfo = localStorage.getItem("licInfo");
    return licInfo ? decryptJson(licInfo) : [];
}

function _getPrivilege() {
    let privilegeInfo = localStorage.getItem("privilegeInfo");
    return privilegeInfo ? decryptJson(privilegeInfo) : null;
}

function _getLicenseStatus() {
    let licInfo = localStorage.getItem("licStatus");
    return licInfo ? (licInfo == "true" ? true : false) : null;
}

function _getGlobalSetting(label) {
    let globalSetting = localStorage.getItem("globalSetting");
    let returnData = JSON.parse(globalSetting)
    if (returnData === null) {
        return null
    }
    let filter = returnData.filter((value) => value.label === label)
    return filter;
}

function _getHospitalType() {
    let licInfo = localStorage.getItem("hospitalType");
    return licInfo ? licInfo : null;
}

function _getHospitalLimit() {
    let limit = localStorage.getItem("hospitalLimit");
    return limit ? limit : null;
}

function _getHospitalName() {
    let licInfo = localStorage.getItem("hospitalName");
    return licInfo ? licInfo : null;
}

function _setHospitalId(hospitalId){
    localStorage.setItem('hospitalId',hospitalId)
}

function _getHospitalId(){
    return localStorage.getItem('hospitalId')
}

export const LocalStorageService = {
    setToken: _setToken,
    setDicomToken: _setDicomToken,
    getAccessToken: _getAccessToken,
    getRefreshToken: _getRefreshToken,
    getExpires: _getExpiresIn,
    clearToken: _clearToken,
    clear: _clearAll,
    setUserInfo: _setUserInfo,
    getUserInfo: _getUserInfo,
    getLicense: _getLicense,
    setLicense: _setLicense,
    getLicenseStatus: _getLicenseStatus,
    setLicenseStatus: _setLicenseStatus,
    setPrivilege: _setPrivilege,
    getPrivilege: _getPrivilege,
    setHospitalType: _setHospitalType,
    getHospitalType: _getHospitalType,
    setHospitalName: _setHospitalName,
    getHospitalName: _getHospitalName,
    setHospitalLimit: _setHospitalLimit,
    getHospitalLimit: _getHospitalLimit,
    setGlobalSetting: _setGlobalSetting,
    getGlobalSetting: _getGlobalSetting,
    setLoader: _setLoader,
    getLoader: _getLoader,
    setHospitalDomain: _setHospitalDomain,
    getHospitalDomain: _getHospitalDomain,
    setProcedureData: _setProcedureData,
    getProcedureData: _getProcedureData,
    setPatientData: _setPatientData,
    getPatientData: _getPatientData,
    deleteProcedureData: _deleteProcedureData,
    deletePatientData: _deletePatinetData,
    setdepartmentDisplay: _setdepartmentDisplay,
    getdepartmentDisplay: _getdepartmentDisplay,
    getPatientHeaderData:_getPatientHeaderData,
    deletePatientHeaderData:_deletePatientHeaderData,
    getHopsitalId :_getHospitalId,
    setHospitalId :_setHospitalId
}

export default LocalStorageService;