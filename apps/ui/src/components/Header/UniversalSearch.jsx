import { SearchInput } from "@allocate-core/ui-components";
import { Text } from "@allocate-core/ui-components";
import { Modal } from "@allocate-core/ui-components";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import SearchIcon from "/icons/universalSearch.svg";

import { universalSearch } from "../../api/search";
import { debounce } from "../../common/common";
import { useCommonStore } from "../../store/commonStore";
import styles from "./header.module.css";

const formatResults = (response) => {
  const results = [];
  response.clients.forEach((client) => results.push({ search: client, type: "Clients" }));
  response.projects.forEach((project) =>
    results.push({ search: project, type: "Projects" }),
  );
  response.users.forEach((people) => results.push({ search: people, type: "People" }));
  return results;
};

const UniversalSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useCommonStore(
    (state) => [state.universalSearchValue, state.setUniversalSearchValue],
    shallow,
  );
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const fetchSearchResults = (searchQuery) => {
    setIsLoading(true);
    universalSearch({ search: searchQuery })
      .then((response) => setResults(formatResults(response)))
      .catch((errorResponse) => toast.error(errorResponse?.data?.detail))
      .finally(() => setIsLoading(false));
  };

  const debouncedHandler = useCallback(debounce(fetchSearchResults, 500), []);

  useEffect(() => {
    if (searchValue === "") setResults("");
    else if (searchValue && searchValue.length) debouncedHandler(searchValue);
  }, [searchValue]);

  const resultClickHandle = (type, id) => {
    setIsSearchOpen(false);
    if (type === "People") navigate(`/people/details/${id}`);
    else if (type === "Clients") navigate(`/clients/details/${id}`);
    else if (type === "Projects") navigate(`/projects/details/${id}`);
  };

  return (
    <div>
      <img
        src={SearchIcon}
        alt="Universal search icon"
        className={styles.universalSearchIcon}
        role="presentation"
        onClick={() => setIsSearchOpen(true)}
      />
      <Modal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} showCloseBtn>
        <div className={styles.searchModalContent}>
          <SearchInput
            placeholder="Search across clients, projects, people"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onClear={() => setSearchValue("")}
            showCloseBtn
          />
          <div className={styles.searchResultsContainer}>
            {isLoading ? (
              <Text size="b2" className="flex-center">
                Loading...
              </Text>
            ) : results && results.length ? (
              results.map((res, idx) => (
                <div
                  key={idx}
                  className={`flex space-between ${styles.resultContainer}`}
                  role="presentation"
                  onClick={() => resultClickHandle(res?.type, res.search?.id)}
                >
                  <Text size="b1" fontWeight="medium">
                    {res.search?.name}
                  </Text>
                  <Text size="b2" fontWeight="bold" className="ml-auto">
                    {`in ${res.type}`}
                  </Text>
                </div>
              ))
            ) : (
              <Text size="b2" className="flex-center">
                No Results Found
              </Text>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UniversalSearch;
