import { describe, expect, it } from "vitest";

import { cx, getKeyValuePair } from "./common";

describe("getKeyValuePair", () => {
  it("should convert various types of objects to arrays of key-value pairs", () => {
    const inputs = [
      {},
      { firstName: "John", lastName: "Doe" },
      { age: 30, height: 180 },
      { name: "Alice", age: 25, isStudent: true, grade: undefined },
    ];

    const expectedOutputs = [
      [],
      [
        { key: "firstName", name: "John" },
        { key: "lastName", name: "Doe" },
      ],
      [
        { key: "age", name: 30 },
        { key: "height", name: 180 },
      ],
      [
        { key: "name", name: "Alice" },
        { key: "age", name: 25 },
        { key: "isStudent", name: true },
        { key: "grade", name: undefined },
      ],
    ];

    inputs.forEach((input, index) => {
      const result = getKeyValuePair(input);
      expect(result).toEqual(expectedOutputs[index]);
    });
  });
});

describe("combineClassnames", () => {
  it("should handle string, array, and object inputs correctly", () => {
    const testObj = {
      cx,
      active: "active-class",
      disabled: "disabled-class",
    };

    const inputs = [
      "simple-class",
      ["class1", "class2", "class3"],
      { active: true, disabled: false, custom: true },
    ];

    const expectedOutputs = [
      "simple-class",
      "class1  class2  class3",
      "active-class  custom",
    ];

    inputs.forEach((input, index) => {
      const result = cx.call(testObj, input);
      expect(result).toBe(expectedOutputs[index]);
    });
  });
});
