import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_PET, ADD_DIAG, REMOVE_DIAG, REMOVE_PIN } from '../utils/mutations';
import { QUERY_PET_HEALTH } from '../utils/queries';

// TO CONSIDER: Add message popup after profile update?

export default function HealthInfo({ pet, pin }) {

  // ---------------Code for profile edit--------------- //

  const [formEdit, toggleEdit] = useState(false);
  const [formState, setFormState] = useState({
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age
  })

  const handleFormToggle = async () => toggleEdit(!formEdit)

  const [updatePet] = useMutation(UPDATE_PET, {refetchQueries: [QUERY_PET_HEALTH]});

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Small fix for an issue with data type when editing numbers in the form
    if ( name == "age" ){
      const numValue = parseInt(value)
      setFormState({
        ...formState,
        [name]: numValue
      })
    } else {
      setFormState({
        ...formState,
        [name]: value
      })
    }
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log(formState)

    try { 
      await updatePet({
        variables: { ...formState, petId: pet._id }
      })
      toggleEdit(!formEdit)
    } catch (e) {
      console.error(e)
    }
  }

  // ---------------Code for diagnosis/issue--------------- //

  const [formDiag, toggleDiag] = useState(false);
  const [formDiagState, setDiagState] = useState({
    issue: '',
    location: ''
  })

  const [addDiag] = useMutation(ADD_DIAG, {refetchQueries: [QUERY_PET_HEALTH]});
  const [removeDiag] = useMutation(REMOVE_DIAG, {refetchQueries: [QUERY_PET_HEALTH]})

  const handleDiagToggle = async () => toggleDiag(!formDiag)

  const handleDiagChange = (event) => {
    const { name, value } = event.target;

    setDiagState({
      ...formDiagState,
      [name]: value
    })
  }

  const handleDiagSubmit = async (event) => {
    event.preventDefault();
    console.log(formDiagState)
    try {
      await addDiag({
        variables: { ...formDiagState, petId: pet._id}
      })
      toggleDiag(!formDiag)
    } catch (e) {
      console.error(e)
    }
  }

  const handleRemoveDiag = async (event) => {
    console.log(event.target.dataset.id)
    try {
      await removeDiag({
        variables: { petId: pet._id, diagId: event.target.dataset.id }
      })
    } catch (e) {
      console.error(e)
    }
  }

  // ---------------Code for pins--------------- //

  const [removePin] = useMutation(REMOVE_PIN, {refetchQueries: [QUERY_PET_HEALTH]});

  const handleReadyPin = async (event) => {
    console.log("pinState", pin.pinState)
    if (pin.pinState) {
      pin.readyPin('')
    } else {
      pin.readyPin(event.target.dataset.id)
    }
  }

  const handleRemovePin = async (event) => {
    console.log(event.target.dataset.id)
    try {
      await removePin({
        variables: { petId: pet._id, diagId: event.target.dataset.id }
      })
    } catch (e) {
      console.error(e)
    }
  }

    return (
    <div style={{ border: '1px solid black' }}>
      {formEdit ? (
        <>
          <form onSubmit={handleFormSubmit}>
            Name: <input type="text" placeholder={formState.name} name="name" value={formState.name} onChange={handleChange}/>
            Species: <input type="text" placeholder={formState.species} name="species" value={formState.species} onChange={handleChange}/>
            Breed: <input type="text" placeholder={formState.breed} name="breed" value={formState.breed} onChange={handleChange}/>
            Age: <input type="text" placeholder={formState.age} name="age" value={formState.age} onChange={handleChange}/>
            <button type="submit" style={{ backgroundColor: "grey" }}>Update Pet</button>
          </form>
          <button style={{ backgroundColor: "grey" }} onClick={handleFormToggle}>Cancel Edit</button>
        </>
      ) : (
        <>
          <p>Name: {pet.name}</p>
          <p>Species: {pet.species}</p>
          <p>Breed: {pet.breed}</p>
          <p>Age: {pet.age}</p>
          <p>Adoption Date: {pet.adoptionDate}</p>
          <button style={{ backgroundColor: "grey" }} onClick={handleFormToggle}>Edit Pet Info</button>
        </>
      )}
        <div style={{ border: '1px solid red', margin: '5px' }}>
          <h4>Diagnoses:</h4>
          {formDiag ? (
            <>
              <form onSubmit={handleDiagSubmit}>
                Issue: <input type="text" placeholder="Issue" name="issue" value={formDiagState.issue} onChange={handleDiagChange}/>
                Location: <input type="text" placeholder="Location" name="location" value={formDiagState.location} onChange={handleDiagChange}></input>
                <button type="submit" style={{ backgroundColor: "grey" }}>Add Issue</button>
              </form>
              <button style={{ backgroundColor: "grey" }} onClick={handleDiagToggle}>Discard Issue</button>
            </>
          ) : (
            <>
              <button style={{ backgroundColor: "grey" }} onClick={handleDiagToggle}>Add an Issue</button>
            </>
          )}
          {pet.health.diagnosis.map((item) => (
            <div key={item._id} style={{ border: '1px solid black', margin:'5px' }}>
              <p>Issue: {item.issue}</p>
              <p>Location: {item.location}</p>
              {item.pinPosition ? (
                <>
                  <button style={{ backgroundColor: "grey" }} data-id={item._id} onClick={handleRemovePin}>Remove Pin</button>
                </>
              ) : (
                <>
                  <button style={{ backgroundColor: "grey" }} data-id={item._id} onClick={handleReadyPin}>{pin.pinState ? 'Setting Pin. Click to Cancel' : 'Add Pin'}</button>
                </>
              )}
              <button style={{ backgroundColor: "grey" }} data-id={item._id} onClick={handleRemoveDiag}>Remove This Issue</button>
            </div>
          ))}
        </div>
    </div>
  )
}