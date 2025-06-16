import axios from "axios";
import LocalStorageService from "../services/LocalStorageService"


const register = ()=>{   

    // axios.interceptors.request.use(
    //     config => {

    //         let locationObj = window.location;
    //         let clientId = null;
    //         if(locationObj.href.split("//")[1].split(".")[0] === "www"){
    //             clientId = locationObj.href.split("//")[1].split(".")[1]    

    //         }
    //         else{
    //             clientId = locationObj.href.split("//")[1].split(".")[0]
    //         }

    //         let existingDomain = LocalStorageService.getHospitalDomain();
    //         //LocalStorageService.setHospitalDomain(clientId);
    //         if(!existingDomain){
               
    //             LocalStorageService.setHospitalDomain(clientId)

    //         }

    //         config.headers['clientid'] = clientId;   
            
          
    //         return config;
    //     },
    //     error => {
    //         Promise.reject(error)
    // });

    // axios.interceptors.response.use(res => {    
    //     // localStorageService.setLoader("false")
    //     return res;
    // });
}

export default register;

