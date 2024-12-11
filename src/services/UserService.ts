import mongoose, { Types } from 'mongoose';
import { User, IUser } from '../model/UserModel';
import { UserResource } from 'src/Resources';
import { generateToken } from './TokenService'; // Für das Passwort-Reset-Token
import jwt from 'jsonwebtoken';
//import bcrypt from "bcryptjs";

/**
 * Erstellt einen neuen Benutzer mit E-Mail-Bestätigung
 */

export async function createUser(userResource: UserResource): Promise<UserResource> {
    
    try {
        const existingUser = await User.findOne({ name: userResource.name }).exec();
        if (existingUser) {
            throw new Error("Benutzername existiert bereits.");
        }

        const user = new User({
            name: userResource.name,
            password: userResource.password, // Das Passwort wird im Modell gehasht
            email: userResource.email,       // Optionale E-Mail-Adresse
            emailConfirmed: false,           // E-Mail ist noch nicht bestätigt
            createdAt: new Date(),
        });

        const savedUser = await user.save();

        return {
            id: savedUser._id.toString(),
            name: savedUser.name,
            email: savedUser.email,
            emailConfirmed: savedUser.emailConfirmed,
            createdAt: savedUser.createdAt,
        };
    } catch (error: any) {
        throw new Error(`Fehler beim Erstellen des Benutzers: ${error.message}`);
    }
}

/**
 * Löscht einen Benutzer anhand der ID
 */
export async function deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return result !== null;  // Gibt `true` zurück, wenn ein Benutzer gelöscht wurde, `false`, wenn kein Benutzer gefunden wurde
}

/**
 * Holt einen Benutzer anhand der ID
 */
export async function getUserById(userId: string): Promise<UserResource> {
    try {
        const user = await User.findById(userId).exec();

        if (!user) {
            throw new Error("Benutzer nicht gefunden");
        }

        return {
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            email: user.email,
            //emailConfirmed: user.emailConfirmed,
            createdAt: user.createdAt,
        };
    } catch (error) {
        throw new Error("Fehler beim Abrufen des Benutzers");
    }
}


/** update User */

export async function updateUser(id: string, updatedData: Record<string, any>): Promise<any> {
    try {
       
        const findUser = await User.findOne({_id:id});

        if (!findUser) {
            throw new Error("User nicht gefunden");
        }

        // Benutzer aktualisieren
        const updatedUser = await User.findByIdAndUpdate({_id:id}, updatedData, { new: true }).exec();

        if (!updatedUser) {
            throw new Error("Fehler beim Aktualisieren des Benutzers");
        }

        return updatedUser;
    } catch (error) {
        console.error("Fehler beim Update User:", error);
        throw new Error("Fehler beim Update der User");
    }
}
