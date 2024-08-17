import { render } from "@testing-library/react";
import { useEffect } from "react";
import { expect, test, vi } from "vitest";

import { useClientStore } from "./clientStore";

vi.mock("zustand");

const TestComponent = ({ selector, effect }) => {
  const storeItems = useClientStore(selector);

  useEffect(() => effect(storeItems), [storeItems]);

  return null;
};

test("set client should contain value passed", () => {
  const selector = (store) => ({ setClients: store.setClients, clients: store.clients });
  const effect = vi.fn().mockImplementation((storeItems) => {
    if (storeItems.clients.length === 0) storeItems.setClients([{ name: "test client" }]);
  });
  render(<TestComponent selector={selector} effect={effect} />);
  expect(effect).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledWith(
    expect.objectContaining({ clients: [{ name: "test client" }] }),
  );
});

test("add clients should add passed value to existing clients", () => {
  const selector = (store) => ({
    clients: store.clients,
    addClients: store.addClients,
  });
  const effect = vi.fn().mockImplementation((storeItems) => {
    if (storeItems.clients.length === 1)
      storeItems.addClients([{ name: "test client 1" }]);
    if (storeItems.clients.length === 2)
      storeItems.addClients([{ name: "test client 2" }]);
  });
  render(<TestComponent selector={selector} effect={effect} />);
  expect(effect).toHaveBeenCalledTimes(3);
  expect(effect).toHaveBeenCalledWith(
    expect.objectContaining({
      clients: [
        { name: "test client" },
        { name: "test client 1" },
        { name: "test client 2" },
      ],
    }),
  );
});

test("increment pageNumber should increace it by 1", () => {
  const selector = (store) => ({
    pageNumber: store.pageNumber,
    incrementPageNumber: store.incrementPageNumber,
  });
  const effect = vi.fn().mockImplementation((storeItems) => {
    if (storeItems.pageNumber === 1) storeItems.incrementPageNumber();
  });
  render(<TestComponent selector={selector} effect={effect} />);
  expect(effect).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledWith(
    expect.objectContaining({
      pageNumber: 2,
    }),
  );
});

test("reset should set the store to inital value for filters", () => {
  const selector = (store) => ({
    statusFilter: store.statusFilter,
    resetStore: store.resetStore,
    setStatusFilter: store.setStatusFilter,
    search: store.search,
    setSearch: store.setSearch,
  });
  let restoreCalledOnce = false;
  const effect = vi.fn().mockImplementation((storeItems) => {
    if (storeItems.statusFilter.value === "ACTIVE" && !restoreCalledOnce)
      storeItems.setStatusFilter({
        value: "test",
        label: "test",
      });
    if (storeItems.search === "" && !restoreCalledOnce) storeItems.setSearch("test");
    if (
      storeItems.statusFilter.value === "test" &&
      storeItems.search == "test" &&
      !restoreCalledOnce
    ) {
      storeItems.resetStore();
      restoreCalledOnce = true;
    }
  });
  render(<TestComponent selector={selector} effect={effect} />);
  expect(effect).toHaveBeenCalledTimes(3);

  expect(effect).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      statusFilter: {
        value: "ACTIVE",
        label: "Active",
      },
      search: "",
    }),
  );

  expect(effect).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      statusFilter: {
        value: "test",
        label: "test",
      },
      search: "test",
    }),
  );
  expect(effect).toHaveBeenNthCalledWith(
    3,
    expect.objectContaining({
      statusFilter: {
        value: "ACTIVE",
        label: "Active",
      },
      search: "",
    }),
  );
});
