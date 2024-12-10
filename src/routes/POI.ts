import express from "express";
import { createPOI, deletePOI, getAllPOIs, getPOIById } from "../services/POIService";
import { getTeamByPlayerId, updateTeamPOIs } from "../services/TeamService";

export const poiRouter = express.Router();

/**
 * Route für das Erstellen eines neuen POI
 */
poiRouter.post("/", async (req, res, next) => {
    try {
        const newPOI = await createPOI(req.body);
        res.status(201).send(newPOI);
    } catch (err) {
        res.status(400); 
        next(err);
    }
});

/**
 * Route für das Löschen eines POI anhand der ID
 */
poiRouter.delete("/:id", async (req, res, next) => {
    let id = "";
    if (req.params) {
        id = req.params.id;
    }

    try {
        await deletePOI(id);
        res.status(204).send(); 
    } catch (err) {
        res.status(404);
        next(err);
    }
});

/**
 * Route für das Abrufen eines POI anhand der ID
 */
poiRouter.get("/:id", async (req, res, next) => {
    let id = "";
    if (req.params) {
        id = req.params.id;
    }

    try {
        const poi = await getPOIById(id);
        res.status(200).send(poi); 
    } catch (err) {
        res.status(404); 
        next(err);
    }
});

/**
 * Route für das Abrufen aller POIs
 */
poiRouter.get("/", async (req, res, next) => {
    try {
        const pois = await getAllPOIs();
        res.status(200).send(pois); 
    } catch (err) {
        res.status(500); 
        next(err);
    }
});


poiRouter.post("/claim/:id", async (req, res, next) => {

    const maxPOIClaimDistance = 50; //meter

    let id = ""
    let teams
    let player
    let positionPlayer
    if (req.params) {
        id = req.params.id;
    }
    if(req.body) {
        teams = req.body.teamIds;
        player = req.body.playerId;
        positionPlayer = req.body.positionPlayer;
    }

    try {
        const poi = await getPOIById(id);
        //console.log(`POI Latitude: ${poi.lat}, Player Latitude: ${positionPlayer.lat}, POI Longitude: ${poi.long}, Player Longitude: ${positionPlayer.lng}`);
        const distance = calculateDistance(poi.lat, poi.long, positionPlayer.lat, positionPlayer.lng)
        //console.log(distance)
        const team = await getTeamByPlayerId(player)
        const teamId = team.id;

        if (!team.poiId.includes(id) && teamId) {
            if(distance < maxPOIClaimDistance){
                team.poiId = [...new Set([...team.poiId, id])];
                await updateTeamPOIs(teamId, { poiId: team.poiId }); 
                res.status(200).json({ message: "POI claimed successfully", team });
            } else {
                res.status(300).json({message: `To far away. Current Distance: ${Math.round(distance)} meters`})
            }
        } else {
            res.status(300).json({message: "POI already claimed"})
        }
    } catch (err) {
        res.status(404); 
        next(err);
    }
});


function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degree: number): number => (degree * Math.PI) / 180;

    const R = 6371e3; 
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 

    return distance;
}



export default poiRouter;
