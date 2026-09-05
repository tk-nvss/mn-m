import mongoose from "mongoose";


function getEventModel() {
  if (mongoose.models && mongoose.models.Event) {
    return mongoose.models.Event;
  }


  const EventSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        default: "",
      },
      image: {
        type: String,
        default: "", // Poster / Cover Image URL
      },
      startDate: {
        type: Date,
        required: true,
        index: true,
      },
      endDate: {
        type: Date,
        default: null,
      },
      game: {
        type: String,
        default: "MLBB",
      },
      eventType: {
        type: String,
        default: "In-Game Event",
      },
      link: {
        type: String,
        default: "",
      },
      location: {
        type: String,
        default: "Online",
      },
      isFeatured: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["active", "upcoming", "completed", "cancelled"],
        default: "active",
        index: true,
      },
      color: {
        type: String,
        default: "#3b82f6",
      },
    },
    { timestamps: true }
  );


  EventSchema.index({ startDate: 1, status: 1 });

  return mongoose.model("Event", EventSchema);
}


export default getEventModel();
