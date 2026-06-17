import Blockout from "../models/Blockout";

async function getBlockouts(req, res) {
    try {
        let complexId;
        if (req.user.role === 'superadmin') {
            if (!req.query.complexId) {
                return res.status(400).json({
                    massage: 'se requiere compleId en la query para superadmin'
                })
            }
            complexId = req.query.complexId
        } else {
            complexId = req.user.complexId
            if (!complexId) {
                return res.status(403).json({
                    massage: 'El usuario no tiene el complejo asignado'
                })
            }
        }
        const blockouts = await Blockout.find({complexId})
        res.json(blockouts)
    } catch (error) {
        res.status(500).json({
            massage: error.massage
        })
    }
}



async function createBlockout(req, res) {
    try {
        let complexId;
        if (req.user.role === 'superadmin') {
            if(!req.body.complexId) {
                res.status(400).json({
                    massage: 'se requiere complexId en el body para superadmin'
                })
            }
            complexId = req.body.complexId
        } else {
            complexId = req.user.complexId
            if (!complexId) {
                return res.status(403).json({
                    massage: 'El usuario no tiene complejo asignado'
                })
            }
        }
        const {name, recurrence, dayOfWeek, startTime, endTime, courtId} = req.body
            if (!name || !recurrence || !startTime ||  !endTime) {
                return res.status(400).json({
                    massage: 'Faltan campos obligatorios (name, recurrence, startTime, endTime)'
                })
            }
            if (recurrence === 'weekly' && !dayOfWeek) {
                return res.status(400).json({
                    massage: 'Para bloqueos semanales, dayOfWeek es obligatorio'
                })
            }
            const blockouts = await Blockout.create({
                complexId,
                name,
                recurrence,
                dayOfWeek: recurrence === 'weekly' ? dayOfWeek : null,
                startTime,
                endTime,
                courtId: courtId || null
            })
            res.status(201).json(blockouts)
    } catch (error) {
        res.status(500).json({
            massage: error.massage
        })
    }
}