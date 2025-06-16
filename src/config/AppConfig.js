export const APPCONFIG = Object.freeze({ 
    //HOST : "http://13.201.35.124:3011/api/",
   // HOST : "http://localhost:3011/api/",
    HOST : "https://radinsightai.com:3013/api/",
    DICOMHOST: "https://radinsightai.com:3014/",
    //DICOMHOST: "http://62.72.43.174:3014//",
    // PYTHONHOST: "http://127.0.0.1:8000/",
    // PYTHONHOST1: "http://127.0.0.1:8001/",  
    PYTHONHOST: "http://10.10.10.213:8000/",
    PYTHONHOST1: "http://10.10.10.213:8001/",
//    HOST: "http://localhost:3011/api/",
    // DICOMHOST: "http://localhost:3010/", 
    AUTH: {
        SECRETKEY: "ZVJhZEFkbWluU2VjcmV0"
    },
    API_STATUS: {
        SUCCESS: "Ok",
        ERROR: "Error"
    },
    PYTHON_API_STATUS: {
        MESSAGE: "Success",
        ERROR: false
    },
    ERROR_MESSAGE_TYPE: {
        INFO: "info",
        WARN: "warning",
        ERROR: "error",
        SUCCESS: "success"

    },
    CATEGORY: {
        InputType: {
            "1": "Dynamic Input",
            "2": "Form Input"
        }
    },
    GLOBAL: {
        SQL_FILE_NAME: "client_table.sql",
        EMAIL_VERIFIED_KEY: "verified",
        USERSTATUS: {
           
            "1": "Approved",
            "2": "Pending",
            "3":"Rejected",
            "4":"Resigned",
        },
        STATUS:{
            "1": "Enabled",
            "2": "Disabled",
        }
    },
})