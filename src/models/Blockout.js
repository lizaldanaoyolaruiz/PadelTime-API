import mongoose from "mongoose";

const blockoutSchema = new mongoose.Schema({
    complexId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'complejo',
        required: true,
        unique: true,
    },
    courtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'court',
        default: null
    },
    name: { type: String, required: true},
    recurrence : {
        type: String,
        enum: ['daily', 'weekly'],
        required: true
    },
    dayOfWeek: {
        type: String,
        enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
        default: true
    },
    startTime:{type: String, required: true},
    endTime:{type: String, required: true},
    isActive:{type: Boolean, default:true},
}, {timestamps: true });

export default mongoose.model('Blockout', blockoutSchema);