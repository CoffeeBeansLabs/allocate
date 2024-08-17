import { useEffect, useMemo, useState } from "react";

export const DEFAULT_ITEMS_PER_PAGE = 6;

const usePagination = (ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE) => {
  const [{ pageIndex, pageCount, totalItems, pageSize }, setPagination] = useState({
    pageIndex: JSON.parse(window.sessionStorage.getItem("pageIndex")) || 0,
    pageCount: 0,
    totalItems: 0,
    pageSize: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    window.sessionStorage.setItem("pageIndex", pagination.pageIndex);
  }, [pageIndex]);

  window.addEventListener("beforeunload", () => sessionStorage.removeItem("pageIndex"));

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageCount,
      totalItems,
      pageSize,
    }),
    [pageIndex, pageCount],
  );

  return [pagination, setPagination];
};

export { usePagination };
