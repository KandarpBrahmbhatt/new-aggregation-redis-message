import CryptoJS from "crypto-js";

const secretKey = "encrypteddatatodecrypteddata"

// encryption decryption configataion file 
export const encryptData = (data) => {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(payload, secretKey).toString();
}

export const decryptData = (encryptedData) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    try {
        return JSON.parse(decryptedText);
    } catch {
        return decryptedText;
    }
}

export const decrypted = decryptData;
