import React from 'react';

//Tätä komponenttia voidaan käyttää monissa muissakin yhteyksissä, joten se on erillinen moduulinsa
const Filter = ({ search, handleSearchChange }) => {
  return (
    <>
      <label>filter shown with</label>
      <input type="search" value={search} onChange={handleSearchChange} />
    </>
  );
};

export default Filter;
