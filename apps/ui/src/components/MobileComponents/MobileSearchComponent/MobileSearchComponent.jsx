import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { debounce } from "../../../common/common";
import { DEFAULT_ITEMS_PER_PAGE } from "../../../constants/common";
import styles from "./MobileSearchComponent.module.css";

const MobileSearchComponent = ({
  searchFor = "",
  handleOnClick = () => {},
  getSearchResults = () => {},
  formatResults = () => {},
}) => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [maxPageCount, setMaxPageCount] = useState(1);
  const [lastElement, setLastElement] = useState(null);

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        setPageNumber((curr) => curr + 1);
      }
    }),
  );

  const fetchSuggestions = (searchQuery = "") => {
    getSearchResults({
      page: pageNumber,
      search: searchQuery,
    })
      .then((response) => {
        if (searchQuery) {
          if (pageNumber === 1 && suggestions.length === 0)
            setSuggestions(formatResults(response[searchFor]));
          else if (
            Math.min(pageNumber * DEFAULT_ITEMS_PER_PAGE, response.count) >
            suggestions.length
          )
            setSuggestions((current) => [
              ...current,
              ...formatResults(response[searchFor]),
            ]);
          setMaxPageCount(Math.ceil(response.count / DEFAULT_ITEMS_PER_PAGE));
        }
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail));
  };

  const debouncedHandler = useCallback(debounce(fetchSuggestions, 500), []);

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElement]);

  useEffect(() => {
    setSuggestions([]);
    setPageNumber(1);
    setMaxPageCount(1);
    if (search) debouncedHandler(search);
  }, [search]);

  useEffect(() => {
    if (pageNumber <= maxPageCount) fetchSuggestions(search);
  }, [pageNumber]);

  return (
    <div className={styles.searchContainer}>
      <input
        className={styles.inputContainer}
        type="Search"
        value={search}
        placeholder={`Search ${searchFor} here`}
        onChange={(e) => setSearch(e.target.value)}
      />
      {suggestions.length ? (
        suggestions.map((suggestion, idx) => {
          const isLastElement = idx === suggestions.length - 1;
          return (
            <div
              key={suggestion.id}
              ref={isLastElement ? setLastElement : undefined}
              className={styles.suggestions}
              role="presentation"
              onClick={() => handleOnClick(suggestion?.id)}
            >
              <div>{suggestion.name}</div>
            </div>
          );
        })
      ) : (
        <div className={styles.emptySearchResult}>{`No ${searchFor} found`}</div>
      )}
    </div>
  );
};

MobileSearchComponent.defaultProps = {
  searchFor: "",
  handleApplyFilter: () => {},
  getSearchResults: () => {},
  formatResults: () => {},
};

MobileSearchComponent.propTypes = {
  searchFor: PropTypes.string.isRequired,
  handleApplyFilter: PropTypes.func.isRequired,
  getSearchResults: PropTypes.func.isRequired,
  formatResults: PropTypes.func.isRequired,
};

export default MobileSearchComponent;
