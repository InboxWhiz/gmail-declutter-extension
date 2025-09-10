import { useApp } from "../../../providers/app_provider";
import "./searchBar.css";

export const SearchBar = () => {
  const { searchTerm, setSearchTerm } = useApp();

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>
  );
};
