const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    vitals: [
        {
            name: { type: String, required: true },
            value: { type: String, required: true }
        }
    ],
    complaints: { type: [String], required: true },
    diagnosis: { type: [String], required: true },
    medicines: [
        {
            name: { type: String, required: true },
            dose: { type: String, required: true },
            when: { type: String, required: true },
            frequency: { type: String, required: true },
            duration: { type: String, required: true },
            Qty: { type: Number, required: true },
            Note: { type: String }
        }
    ],
    nextVisit: { type: Date, required: true }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
