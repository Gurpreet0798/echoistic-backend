import jwt from "jsonwebtoken";
import logger from "./logger";

const sign = async (payload:Object, expiresIn:string, secret:string) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, { expiresIn }, (error, token) => {
      if (error) {
        logger.error(error);
        reject(error);
      } else {
        resolve(token);
      }
    });
  });
};



const verify = async (token:string, secret:string) => {
  return new Promise((resolve) => {
    jwt.verify(token, secret, (error, payload) => {
      if (error) {
        logger.error(error);
        resolve(null);
      } else {
        resolve(payload);
      }
    });
  });
};

export default { sign, verify };
