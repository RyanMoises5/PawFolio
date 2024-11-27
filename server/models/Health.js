const { Schema, Types } = require('mongoose');

const allergySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const vetSchema = new Schema(
  {
    name: {
      type: String,
    },
    location: {
      type: String,
    },
    speciality: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

const diagSchema = new Schema({
  issue: {
    type: String,
  },
  startDate: {
    type: Date,
    default: Date.now(),
  },
  endDate: {
    type: Date,
  },
  location: {
    type: String,
  },
  pinPosition: {
    type: String,
  },
});

const notesSchema = new Schema(
  {
    description: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    _id: false,
  }
);

// Schema for weight records
const weightRecordSchema = new Schema(
  {
    date: {
      type: String, // Store dates in YYYY-MM-DD format
      required: true,
    },
    weight: {
      type: Number, // Weight as a number
      required: true,
    },
  },
  {
    _id: true, // Generate unique IDs for each weight record
  }
);

const healthSchema = new Schema(
  {
    allergies: [allergySchema],
    vet: [vetSchema],
    diagnosis: [diagSchema],
    notes: [notesSchema],
    weightRecords: [weightRecordSchema], // Add weightRecords field
  },
  {
    _id: false,
  }
);

module.exports = healthSchema;
