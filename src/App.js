import React, { useState, useEffect } from 'react'
import './App.css'
import Filter from './components/Filter'
import { NewPerson, Persons } from './components/Persons'
import Notification from './components/Notification'
import personsService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  // Kaikki henkilöt haetaan renderöinnin jälkeen
  useEffect(() => {
    personsService
      .getAll()
      .then((initialPersons) => {
        setPersons(initialPersons)
      })
      .catch((error) => {
        setError(`The data from the server couldn't be reached`)
        notificationTimeOut(5)
      })
    // Tämä tyhjä taulukko määrittää, ettei toimintoa suoriteta kuin kerran.
  }, [])

  // Henkilöiden hakeminen uudelleen tarvittaessa
  const loadPersons = () => {
    personsService
      .getAll()
      .then((initialPersons) => {
        setPersons(initialPersons)
      })
      .catch((error) => {
        setError(`The data from the server couldn't be reached`)
        notificationTimeOut(5)
      })
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
  }

  // Tarkistetaan löytyykö syötettyä arvoa tietokannasta saaduista tiedoista
  const nameDoubles = () =>
    persons.findIndex((person) => person.name === newName.trim()) > -1

  const numberDoubles = () =>
    persons.findIndex((person) => person.number === newNumber.trim()) > -1

  const emptyInputs = () => {
    setNewName('')
    setNewNumber('')
  }

  // Ilmoitukset ja virheilmoitukset poistetaan viiden sekunnin kuluttua, ellei toisin määritetä.
  const notificationTimeOut = (seconds = 5) => {
    setTimeout(() => {
      setMessage(null)
      setError(null)
    }, seconds * 1000)
  }

  /*Haku tehdään numeron perusteella jos search-kenttään syötetään numeroita.
    Jos numeroita ei ole, haku tehdään case-insensitiivisesti muuttamalla vertailua
    varten hakukohteiden nimet ja hakukentän tekstin lowercase-muotoon.*/
  const personsToShow = search.match(/\d/)
    ? persons.filter((person) => person.number.includes(search))
    : typeof search === 'string'
    ? persons.filter((person) =>
        person.name.toLowerCase().includes(search.toLowerCase())
      )
    : persons

  // Henkilön poisto ja poiston varmistus.
  const removePerson = (event) => {
    const userId = event.target.value
    // IDtä vastaava nimi haetaan henkilöiden tiedoista varmistusta varten.
    const selectedPerson = persons.find((person) => person.id === userId)
    window.confirm(`Delete ${selectedPerson.name} ?`)
      ? personsService
          .remove(userId)
          .then(() => {
            setPersons(persons.filter((person) => person.id !== userId))
            setMessage(`Successfully deleted ${selectedPerson.name}`)
            notificationTimeOut(3)
          })
          .catch((error) => {
            setError('The person could not be found. Please refresh and retry.')
            notificationTimeOut()
          })
      : console.log('Delete canceled')
  }

  /*addPerson lisää henkilön, mikäli tietoja ei ole jo lisätty ja muokkaa tietoja
  jos nimi on jo tiedoissa. */
  const addPerson = (event) => {
    event.preventDefault()
    /*henkilöt ladataan tässä kohtaa uudestaan varmistukseksi,
    että tietoja ei voi lisätä tuplana yhtä aikaa toisella selaimella.
    Tämän voisi toteuttaa myös muutamalla useEffectin päivitysehdon sopivaksi.*/
    loadPersons()

    if (newName && newNumber) {
      const personObject = {
        name: newName.trim(),
        number: newNumber.trim(),
      }

      const nameDouble = nameDoubles()
      const numberDouble = numberDoubles()

      //jos nimi ja numero ovat uusia (ei tuplia) luodaan uusi henkilö
      if (!nameDouble && !numberDouble) {
        personsService
          .create(personObject)
          .then((createdPerson) => {
            setPersons(persons.concat(createdPerson))
            setMessage(`${createdPerson.name} was successfully added`)
            notificationTimeOut(5)
          })
          .catch((error) => {
            setError(error.response.data.error)
            notificationTimeOut(6)
          })
      } else if (nameDouble && !numberDouble) {
        //jos nimi esiintyy tuplana, mutta syötetty numero on uusi, kysytään halutaanko päivittää.
        window.confirm(
          `${personObject.name} is already added to phonebook, replace the old number with a new one?`
        )
          ? updatePerson(personObject.number, personObject.name).catch(
              (error) => {
                setError(error.response.data.error)
                notificationTimeOut(3)
              }
            )
          : console.log('canceled')
      } else if (!nameDouble && numberDouble) {
        //jos numero esiintyy tuplana, mutta nimi ei, ei lisäystä hyväksytä.
        setError(`Given phonenumber is already in use`)
        notificationTimeOut()
      } else if (nameDouble && numberDouble) {
        //jos mitkään ylläolevista ehdoista eivät täyty, molemmat tiedot ovat jo lisätty, eikä lisäystä hyväksytä.
        setError(`${newName.trim()} has already been added to phonebook`)
        notificationTimeOut()
      }
      emptyInputs()
    }
  }

  //Etsii ja päivittää oikean henkilön.
  const updatePerson = (number, name) => {
    const id = persons.find((person) => person.name === name).id
    const person = persons.find((n) => n.id === id)
    const changedPerson = { ...person, number: number }

    personsService
      .update(id, changedPerson)
      .then((response) => {
        if (response.status === 404) {
          // axios ei ilmoita tilaa 404 virheenä, joten se on määritettävä sellaiseksi itse
          throw new Error('404')
        } else {
          loadPersons()
          setMessage(`${person.name}'s number was successfully updated`)
          notificationTimeOut(5)
        }
      })
      .catch((error) => {
        setError(`Information of ${person.name} has already been deleted`)
        notificationTimeOut(5)
      })
    emptyInputs()
  }

  return (
    <main>
      <h2>Phonebook</h2>

      <Filter search={search} handleSearchChange={handleSearchChange} />

      <div className="notification-box">
        <Notification message={message} error={error} />
      </div>

      <h3>Add new</h3>
      <NewPerson
        addPerson={addPerson}
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>
      <Persons
        personsToShow={personsToShow}
        removePerson={removePerson}
        setPersons={setPersons}
      />
    </main>
  )
}

export default App
