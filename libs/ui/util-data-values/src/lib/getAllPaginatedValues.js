const getAllPaginatedValues = async (
  fetchFunction,
  value,
  payload,
  pageNo = 1,
  pageSize = 10,
  allValues = [],
) => {
  const results = await fetchFunction({
    size: pageSize,
    page: pageNo,
    ...payload,
  });
  const pageTotal = Math.ceil(results.count / pageSize);
  if (pageNo <= pageTotal) {
    return allValues.concat(
      await getAllPaginatedValues(
        fetchFunction,
        value,
        payload,
        pageNo + 1,
        pageSize,
        results[value],
      ),
    );
  }
  return results[value];
};

export { getAllPaginatedValues };
