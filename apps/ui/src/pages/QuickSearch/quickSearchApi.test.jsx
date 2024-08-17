import MockAdapter from "axios-mock-adapter";
import { beforeEach, describe, expect, it } from "vitest";

import AuthenticatedAPI from "../../api/API.js";
import { getCitiesOfCountryOfTalents } from "../../api/dropdowns.js";

describe("getCitiesOfCountryOfTalents", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(AuthenticatedAPI);
  });

  afterEach(() => {
    mock.reset();
  });

  it("should return an empty array when no country name is provided", async () => {
    const result = await getCitiesOfCountryOfTalents();
    expect(result).toEqual([]);
    expect(mock.history.get.length).toBe(0);
  });

  it("should return cities when a valid country name is provided", async () => {
    const mockCities = { cities: ["New York", "Los Angeles", "Chicago"] };
    mock.onGet("/user/get-user-cities/?countries=USA").reply(200, mockCities);

    const result = await getCitiesOfCountryOfTalents("USA");

    expect(mock.history.get[0].url).toBe("/user/get-user-cities/?countries=USA");
    expect(result).toEqual(mockCities);
  });

  it("should handle country names with spaces", async () => {
    const mockCities = { cities: ["London", "Manchester"] };
    mock
      .onGet("/user/get-user-cities/?countries=United%20Kingdom")
      .reply(200, mockCities);

    await getCitiesOfCountryOfTalents("United Kingdom");

    expect(mock.history.get[0].url).toBe(
      "/user/get-user-cities/?countries=United%20Kingdom",
    );
  });

  it("should reject with an error when API call fails", async () => {
    mock
      .onGet("/user/get-user-cities/?countries=ErrorLand")
      .reply(500, { message: "API Error" });

    await expect(getCitiesOfCountryOfTalents("ErrorLand")).rejects.toThrow(
      "Request failed with status code 500",
    );

    expect(mock.history.get[0].url).toBe("/user/get-user-cities/?countries=ErrorLand");
  });
});
