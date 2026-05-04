// import React from "react";

const SearchBar = ({ value, onChange, onSearch }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search School..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={onSearch}>Search</button>
    </div>
  );
};

export default SearchBar;