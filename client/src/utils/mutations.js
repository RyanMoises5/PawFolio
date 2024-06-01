import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      owner {
        _id
        username
      }
    }
  }
`;

export const CREATE_OWNER = gql`
  mutation createOwner($username: String!, $email: String!, $password: String!) {
    createOwner(username: $username, email: $email, password: $password) {
      token
      owner {
        _id
        username
      }
    }
  }
`;

export const ADD_PET = gql`
  mutation addPet($name: String, $species: String!, $breed: String, $age: Int) {
    addPet(name: $name, species: $species, breed: $breed, age: $age) {
      _id
      username
      petCount
    }
  }
`;

export const REMOVE_PET = gql`
  mutation Mutation($petId: String!) {
    removePet(petId: $petId) {
      _id
      username
      petCount
    }
  }
`;

export const UPDATE_PET = gql`
  mutation updatePet($petId: String!, $species: String!, $name: String, $pic: String, $bio: String) {
    updatePet(petId: $petId, species: $species, name: $name, pic: $pic, bio: $bio) {
      _id
      name
    }
  }
`;