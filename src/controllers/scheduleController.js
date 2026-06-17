import { json } from "express"
import { getScheduleWithMetrics } from "../services/scheduleService"
import Blockout from "../models/Blockout"

async function getSchedule(req, res) {
    try {
        let complexId
        if (req.user.role === 'superadmin') {
            if (!req.query.complexId) {
                return res.status(400).json({massage : 'se requiere complexId en la query para superadmin'})
            }
            complexId = req.query.complexId
        } else {
            complexId = req.user.complexId
            if (!complexId) {
                return res.status(403).json({massage: 'el usuario no tiene complejo asignado'})

            }
        } 
        const data = await getScheduleWithMetrics(complexId)
        res.json(data)    
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

async function updateScheduleConfig(req, res) {
    try {
        let complexId;
        if (req.user.role === 'superadmin') {
            if (!req.body.complexId) {
                return res.status(400).json({
                    massage: 'se requiere complexId en el body para superadmin'
                })
            }
            complexId = req.body.complexId
        } else{
            complexId = req.user.complexId
            if (!complexId) {
                return res.status(403).json({
                    massage: 'El usuario no tiene complejo asignado'
                })
            }
        }
        const alloweUpdates = [
            'onlineStatus', 'publicBookingEnabled', 'openingDays',
            'openTime', 'closeTime', 'activeExtra1', 'activeExtra2'
        ]
        const updateData = alloweUpdates.reduce((acc, key) => {
            if(req.body[key] !== undefined) acc[key] = req.body[key]
            return acc
        }, {})

        const updated = await updateScheduleConfig(complexId,updateData,req.user._id)
        res.json(updated)
    } catch (error) {
        res.status(500).json({
            massage: error.massage
        })
    }
    
}