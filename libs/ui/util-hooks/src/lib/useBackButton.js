const useBackButton = (callback) => {
  const handleEvent = (event) => {
    event.preventDefault();
    callback();
    window.history.go(1);
  };

  window.addEventListener("popstate", handleEvent);
  return () => window.removeEventListener("popstate", handleEvent);
};

export { useBackButton };
