import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    complexId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'complejo',
        require: true,
        unique: true
    },

    onlineStatus:{Type: boolea, default: true},
    publicBookingEnabled: {Type: boolea, default: true},
    openingDays: {
        Type: [String],
        enum:['lunes','martes','miercoles','jueves','viernes','sabado','domingo'],
        default: ['lunes', 'martes','miercoles', 'jueves', 'viernes']
    },
  
    update: {Type: mongoose.Schema.Type.ObjectId, ref: 'user'}
},{timestamps: true});

export default mongoose.model('Schedule', scheduleSchema);
