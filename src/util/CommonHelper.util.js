import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchCitiesByStateId } from "../appRedux/actions/Cities.Actions";
import LocalStorageService from "../services/LocalStorageService"
import { APPCONFIG } from "../config/APPConfig";

export const alphabetArray = "abcdefghijklmnopqrstuvwxyz";

export const Capitalize = (str) => {
    // console.log(str.charAt(0).toUpperCase() + str.slice(1),str)
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const PrivilegeCheck = (value, mode) => {
    // latest priviledge flow

    // priviledge is validate using routes
    return true;

    // const userInfo = LocalStorageService.getUserInfo("userInfo");
    // if (userInfo && userInfo.user && userInfo.user.role && userInfo.user.role.roleName === "SuperAdmin") {
    //     return true;
    // } else if (userInfo && userInfo.user && userInfo.user.role && userInfo.user.role.roleName === "Administrator") {
    //     if (value === 'approve' || value === 'reject' || value === 'resign') {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // } else {
    //     return false;
    // }
    let privilegeInfo = LocalStorageService.getPrivilege()
    // return true
    if (privilegeInfo !== null) {
        const filterTable = privilegeInfo.filter(o =>
            // console.log(o)
            Object.keys(o).some(k =>
                (k === "pagesId" ? String(o[k]).toLowerCase() === value.toLowerCase() : false)
            )
        );
        if (filterTable[0] && mode === 1) {
            return filterTable[0].creatRecord
        }
        else if (filterTable[0] && mode === 2) {
            return filterTable[0].updateRecord
        }
        else if (filterTable[0] && mode === 3) {
            return filterTable[0].viewRecord
        }
        else if (filterTable[0] && mode === 4) {
            return filterTable[0].deleteRecord
        } else {
            return false
        }
    }
    else {
        return false
    }

}


// export const CitiesCheck = (stateId, cityId) => {
//     const completeCityInfo = useSelector(state => state.cities);
//     const dispatch = useDispatch()
//     useEffect(() => {
//         dispatch(fetchCitiesByStateId(stateId))
//     }, [])
//     useEffect(() => {
//         if (Object.keys(completeCityInfo.list).length !== 0) {
//             // completeCityInfo.list.filter(data => da)
//         }
//     }, [completeCityInfo.list])
// }

export const fileupdate = (e) => {
    if (Array.isArray(e)) {
        return e;
    }

    setTimeout(async () => {
        // let fileDetails = e.fileList[e.fileList.length - 1].originFileObj ;
        // if(fileDetails.size / 1024 > maxFileUploadSize){
        //     showErrorMessage("File size should be less than or equal to "+maxFileUploadSize+"kb.");
        //     return;
        // }
        // let base64FileContent = await getBase64(fileDetails);
        // setFileContent(fileDetails);            
        // setUpdateImage(true);
        // setPreview(base64FileContent);
    })

    // let getBase64 = (file) => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.readAsDataURL(file);
    //         reader.onload = () => resolve(reader.result);
    //         reader.onerror = error => { reject(error); };
    //     });
    // }
    return e && e.fileList;
}

export const isNotEmpty = (obj) => obj && Object.keys(obj).length
export const isNotEmptyResponse = (obj) => obj !== undefined && obj !== null && Object.keys(obj).length ? true : false;

export const isJson = (item) => {
    let value = typeof item !== "string" ? JSON.stringify(item) : item;    
    try {
      value = JSON.parse(value);
    } catch (e) {
        console.log(e)
      return false;
    }
      
    return typeof value === "object" && value !== null;
  }
  
export const changeJSONString = (value) => value !== null && value !== undefined?value.replace("{","").replace("}","").replaceAll("\"","").split(","):[]

export const changeStringArray = (value) => value !== null && value !== undefined?value.replace("[", "").replace("]", "").replaceAll("\"", "").split(","):[]

export const checkValue = (value,returnValue) => value !== null && value !== undefined?value:returnValue



export const formatList = async (hospitalsList,userListFlag)=>{
    if(!hospitalsList) return  hospitalsList;
    let GLOBAL = APPCONFIG.GLOBAL;
    let STATUS ;
    if(userListFlag){
        STATUS = GLOBAL.USERSTATUS;
    }
    else{
        STATUS =  GLOBAL.STATUS

    }
    hospitalsList = hospitalsList.map((v,index) => {
        v.sno = index+1;
        v.status = STATUS[v.status];
        return v;
    });
    return hospitalsList;
}
export const formatListwithoutStatus = async (hospitalsList)=>{
    if(!hospitalsList) return  hospitalsList;
    const GLOBAL = APPCONFIG.GLOBAL;
    hospitalsList = hospitalsList.map((v,index) => {
        v.sno = index+1;
        // v.status = GLOBAL.STATUS[v.status];
        return v;
    });
    return hospitalsList;
}

