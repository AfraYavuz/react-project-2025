import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  [key: string]: unknown;
}

class JWTToken {
  static getDecodeToken(token: string): DecodedToken {
    return jwtDecode<DecodedToken>(token);
  }

  static getExpiryTime(token: string): number {
    const jwt = jwtDecode<DecodedToken>(token);
    return jwt.exp;
  }

  static isTokenExpired(token: string): boolean {
    const jwt = jwtDecode<DecodedToken>(token);
    const expiryTime = jwt.exp;
    return 1000 * expiryTime - new Date().getTime() < 5000;
  }
}

export default JWTToken;
