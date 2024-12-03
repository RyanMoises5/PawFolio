const { Owner, Pet, Event } = require('../models')
const { signToken } = require('../utils/auth')
const { AuthenticationError } = require("apollo-server-express");


const resolvers = {
  Query: {
    owners: async () => {
      return Owner.find({}).populate('pets');
    },
    pet: async (parent, { petId }) => {
      return Pet.findById(petId).populate('owner').populate('events').populate('friends');
    },
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await Owner.findOne({ _id: context.user._id }).populate('pets').populate({
          path: 'pets',
          populate: 'events',
          sort: { startTime: -1 }
        });

        return userData;
      }
      throw new AuthenticationError('Not logged in');
    }
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const owner = await Owner.findOne({ email });
      if (!owner) {
        throw AuthenticationError;
      }

      const correctPw = await owner.isCorrectPassword(password);
      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(owner);

      return { token, owner };
    },
    createOwner: async (parent, { username, email, password }) => {
      const owner = await Owner.create({ username, email, password });
      const token = signToken(owner)
      return { token, owner };
    },
    addPet: async (parent, args, context) => {
      if (context.user) {
        const pet = await Pet.create({ ...args, owner: context.user._id });

        const owner = await Owner.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { pets: pet._id } },
          { runValidators: true, new: true }
        )

        return owner;
      }
      throw AuthenticationError;
    },
    removePet: async (parent, { petId }, context) => {
      if (context.user) {
        const pet = await Pet.findOneAndDelete({ _id: petId });

        const owner = await Owner.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { pets: petId } },
          { runValidators: true, new: true }
        )

        return owner;
      }
      throw AuthenticationError;
    },
    updatePet: async (parent, { petId, ...rest }, context) => {
      if (context.user) {
        const pet = await Pet.findOneAndUpdate(
          { _id: petId },
          { ...rest },
          { runValidators: true, new: true }
        )

        return pet;
      }
      throw AuthenticationError;
    },
    addFriend: async (parent, { petId, friendId } , context) => {
      if (context.user) {
        const pet = await Pet.findOneAndUpdate(
          { _id: petId },
          { $addToSet: { friends: friendId } },
          { runValidators: true, new: true }
        )

        return pet;
      }
      throw AuthenticationError;
    },
    removeFriend: async (parent, { petId, friendId }, context) => {
      if (context.user) {
        const pet = await Pet.findOneAndUpdate(
          { _id: petId },
          { $pull: { friends: friendId } },
          { runValidators: true, new: true }
        )

        return pet;
      }
      throw AuthenticationError;
    },
    updateBio: async (parent, { petId, bio }, context) => {
      if (context.user) {
        const pet = await Pet.findOneAndUpdate(
          { _id: petId },
          { $set: { bio: bio } },
          { runValidators: true, new: true }
        )
        return pet;
      }
      throw AuthenticationError;
    },
    // Used for testing; Unused in client-side
    addAllergy: async (parent, { petId, name }, context) => {
      if (context.user) {
        const pet = await Pet.findOneAndUpdate(
          { _id: petId },
          { $addToSet: { "health.allergies": { name } } },
          { runValidators: true, new: true }
        )

        return pet;
      }
      throw AuthenticationError;
    },
    addDiag: async (parent, { petId, ...rest }, context) => {
      if (context.user) {
        const pet = await Pet.findOneAndUpdate(
          { _id: petId },
          { $addToSet: { "health.diagnosis": { ...rest } } },
          { runValidators: true, new: true }
        )

        return pet;
      }
      throw AuthenticationError;
    },
    removeDiag: async (parent, { petId, diagId }, context) => {
      if (context.user) {
        const pet = await Pet.findOneAndUpdate(
          { _id: petId },
          { $pull: { "health.diagnosis": { _id: diagId } } },
          { runValidators: true, new: true }
        )
        return pet
      }
      throw AuthenticationError;
    },
    setPin: async (parent, { petId, diagId, pinPosition }, context) => {
      if (context.user) {
        const pet = await Pet.findOneAndUpdate(
          { _id: petId, "health.diagnosis._id": diagId },
          { $set: { "health.diagnosis.$.pinPosition": pinPosition } },
          { runValidators: true, new: true }
        )
        return pet
      }
      throw AuthenticationError;
    },
    removePin: async (parent, { petId, diagId }, context) => {
      if (context.user) {
        const pet = await Pet.findOneAndUpdate(
          { _id: petId, "health.diagnosis._id": diagId },
          { $unset: { "health.diagnosis.$.pinPosition": "" } },
          { runValidators: true, new: true }
        )
        return pet
      }
      throw AuthenticationError;
    },
    addEvent: async (parent, { petId, ...rest  }, context) => {
      if (context.user) {
        const event = await Event.create({ ...rest });
        const pet = await Pet.findOneAndUpdate(
          { _id: petId },
          { $addToSet: { events: event._id } },
          { runValidators: true, new: true }
        ).populate('events');
        return pet;
      }
      throw new AuthenticationError('Not logged in');
    },
    removeEvent: async (parent, { petId, eventId }, context) => {
      if (context.user) {
        await Event.findOneAndDelete({ _id: eventId });
        const pet = await Pet.findOneAndUpdate(
          { _id: petId },
          { $pull: { events: eventId } },
          { runValidators: true, new: true }
        ).populate('events');
        return pet;
      }
      throw new AuthenticationError('Not logged in');
    },
    addWeightRecord: async (parent, { petId, date, weight }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in!");
      }
    
      const updatedPet = await Pet.findByIdAndUpdate(
        petId,
        {
          $push: { "health.weightRecords": { date, weight } },
        },
        { new: true }
      );
    
      if (!updatedPet) {
        throw new Error("Pet not found.");
      }
    
      return updatedPet.health; // Ensure this returns the updated health data
    },
              
    deleteWeightRecord: async (parent, { petId, date }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in!");
      }
    
      // Update the pet's weight records by pulling the entry with the matching date
      const updatedPet = await Pet.findByIdAndUpdate(
        petId,
        {
          $pull: { "health.weightRecords": { date } }, // Removes the record matching the date
        },
        { new: true }
      );
    
      if (!updatedPet) {
        throw new Error("Pet not found.");
      }
    
      return updatedPet.health; // Return the updated health data
    },    
  }
}

module.exports = resolvers;