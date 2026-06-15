import mongoose from "mongoose";

const blockoutSchema = new mongoose.Schema({
    complexId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'complejo',
        requiere: true,
        unique: true,
    },
    
})