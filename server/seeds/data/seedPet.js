const db = require('../../config/connection');
const { Owner, Pet } = require('../../models')

const seedPet = async (owners) => {
  const seededPets = await Pet.create(
    [
      {
        "name": "Bella",
        "species": "Dog",
        "breed": "Labrador Retriever",
        "age": 3,
        "owner": owners[0]
      },
      {
        "name": "Luna",
        "species": "Cat",
        "breed": "Siamese",
        "age": 2,
        "owner": owners[0],
        "health": 
          {
            "allergies": 
              [
                {
                  "name": "egg"
                },
                {
                  "name": "bees"
                }
              ],
            "vet": 
              {
                "vetName": "Dr. Shou Tucker",
                "speciality": "primary"
              },
            "diagnosis":
              {
                "issue": "rash",
                "location": "lower left torso"
              },
          }
      },
      {
        "name": "Max",
        "species": "Dog",
        "breed": "German Shepherd",
        "age": 4,
        "owner": owners[1]
      }
    ]
  )

  for (let i = 0; i < seededPets.length; i++) {
    const pet = seededPets[i]
    await Owner.findOneAndUpdate(
      { _id: pet.owner._id },
      { $addToSet: { pets: pet._id } },
      { new: true, runValidators: true }
    )
  }

  console.log('-----------Pet data seeded!-----------');
  return seededPets;
}

module.exports = seedPet;