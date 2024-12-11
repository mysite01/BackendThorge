import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';

/**
 * Generiert ein einmaliges Token, z. B. für Passwort-Zurücksetzen
 */
export const generateToken = (): string => {
    return crypto.randomBytes(20).toString('hex'); // 40-stelliges Token
};

/**
 * Generiert ein JSON Web Token (JWT)
 */
export const generateJWT = (payload: object): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token gültig für 1 Stunde
};

/**
 * Überprüft ein JSON Web Token (JWT)
 */
export const verifyJWT = (token: string): JwtPayload => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === "string") {
        throw new Error("Invalid token payload: Expected an object but received a string.");
    }

    return decoded as JwtPayload; 
};
