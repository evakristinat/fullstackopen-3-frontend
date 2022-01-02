import React from 'react';

const NewPerson = ({
  addPerson,
  newName,
  newNumber,
  handleNameChange,
  handleNumberChange,
}) => {
  return (
    <form onSubmit={addPerson}>
      <label>name: </label>
      <input type="text" value={newName} onChange={handleNameChange} />

      <label>number:</label>
      <input
        type="tel"
        minLength="8"
        value={newNumber}
        onChange={handleNumberChange}
      />

      <button type="submit">add</button>
    </form>
  );
};

const Persons = ({ personsToShow, removePerson }) => {
  return (
    <table>
      <tbody>
        {personsToShow.map((person) => (
          <tr key={person.id}>
            <td key={person.name}>{person.name}</td>
            <td key={person.number}>{person.number}</td>
            <td>
              <button value={person.id} onClick={removePerson}>
                delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export { NewPerson, Persons };
