import AES from 'crypto-js/aes';
import * as CryptoJS from "crypto-js";
import { APPCONFIG } from '../config/AppConfig';

export const encryptFieldUsingAES = (value)=>{
    return AES.encrypt(value, APPCONFIG.AUTH.SECRETKEY).toString();
}

export const decryptFieldUsingAES = (value)=>{
  return AES.decrypt(value, APPCONFIG.AUTH.SECRETKEY).toString(CryptoJS.enc.Utf8);
}

export const getEncryptedShaValue = (value)=>{
  return CryptoJS.SHA256(value).toString();
}

export const getEncryptedMD5Value = (value)=>{
  return CryptoJS.MD5(value).toString();
}

export const encryptJson = (data) =>{
    return CryptoJS.AES.encrypt(JSON.stringify(data), APPCONFIG.AUTH.SECRETKEY,
     {
        keySize: 128 / 8,
        iv: APPCONFIG.AUTH.SECRETKEY,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString();
    };
    
    export const  decryptJson = (data) => {
    return JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(data,  APPCONFIG.AUTH.SECRETKEY, 
    {
        keySize: 128 / 8,
        iv: APPCONFIG.AUTH.SECRETKEY,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })));
    }