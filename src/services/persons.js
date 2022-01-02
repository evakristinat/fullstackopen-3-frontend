import axios from 'axios';
// baseUrl ennen Mongon käyttöä: 
// const baseUrl = 'http://localhost:3001/api/persons';
const baseUrl = '/api/persons';

// haetaan kaikki henkilöt tietokannasta APIa hyödyntäen
const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

// luodaan uusi henkilö POSTaamalla käyttöliittymään syötetty henkilöobjekti
const create = (newObject) => {
  const request = axios.post(baseUrl, newObject);
  return request.then((response) => response.data);
};

// päivitetään annettua IDtä vastaavan henkilön tiedot käyttöliitymän tiedoilla PUTilla 
const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject);
  return request.then((response) => response);
};

// poistetaan IDtä vastaava käyttäjä DELETEllä
const remove = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`);
  return request.then((response) => response.data);
};

const personsService = { getAll, create, update, remove };

export default personsService;
