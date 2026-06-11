import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    complexId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'complex',
        require: true,
        unique: true
    },

    onlineStatus:{Type: Boolean, default: true},
    publicBookingEnabled: {Type: Boolean, degault: true},
    openingDays: {
        type: [String],
        enum:['lunes','martes','miercoles','jueves','viernes','sabado','domingo'],
        default: ['lunes', 'martes','miercoles', 'jueve', 'vierne']
    },
    openTime: {type: String, default: '8 AM'},
    closeTime: {type: String, default: '11PM'},
    activeExtra1: {type: String, default: '11PM'},
    activeExtra2: {type: String, default: '11PM'},
    update: {type: mongoose.Schema.Type.ObjectId, ref: 'user'}
},{timestamps: true});

export default mongoose.model('schedule', scheduleSchema);
