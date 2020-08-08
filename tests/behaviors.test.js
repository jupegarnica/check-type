import {
  isValid,
  isValidOrThrowAll,
  isValidOrLogAll,
  hasErrors,
  AsyncFunction,
  GeneratorFunction,
  TypeValidationError,
} from "garn-validator";

describe("isValid", () => {
  test.each([
    [Function, function () {}],
    [Function, () => {}],
    [GeneratorFunction, function* () {}],
    [AsyncFunction, async () => {}],
    [Promise, (async () => {})()],
    [Promise, new Promise(() => {})],
    [Promise, Promise.resolve()],
    [Object, {}],
    [Number, 2],
    [String, "str"],
  ])("isValid(%p)(%p) return true", (a, b) => {
    expect(isValid(a)(b)).toBe(true);
  });
  test.each([
    [AsyncFunction, function () {}],
    [GeneratorFunction, () => {}],
    [Function, function* () {}],
    [Function, async () => {}],
    [Promise, { then() {}, catch() {} }],
    [Promise, Promise],
    [Object, []],
    [Number, "2"],
    [String, 2],
  ])("isValid(%p)(%p) return false", (a, b) => {
    expect(isValid(a)(b)).toBe(false);
  });
});

describe("hasErrors", () => {
  test("should return null", () => {
    expect(
      hasErrors({ num: Number, str: String })({ num: 2, str: "str" })
    ).toBe(null);
  });
  test("should return array of errors", () => {
    expect(
      hasErrors({ num: Number, str: String })({ num: "2", str: "str" })
    ).toEqual([
      new TypeValidationError(
        'on path /num value "2" do not match constructor Number'
      ),
    ]);
  });
  test("should flat all aggregated Errors", () => {
    expect(hasErrors(Number, { x: 1 }, () => false)(true).length).toBe(3);
  });

  test("should flat all aggregated Errors", () => {
    expect(hasErrors(Number, { x: 1, y: 2 }, [1, 2])({}).length).toBe(5);
  });
  describe("in serie", () => {
    test.each([
      [Number, (v) => v > 0, 2, null],
      [
        Number,
        (v) => v > 100,
        2,
        [new TypeValidationError("value 2 do not match validator v=>v>100")],
      ],
      [
        String,
        (v) => v > 100,
        2,
        [
          new TypeValidationError("value 2 do not match constructor String"),
          new TypeValidationError("value 2 do not match validator v=>v>100"),
        ],
      ],
    ])("hasErrors(%p,%p)(%p) === %p", (a, b, input, expected) => {
      expect(hasErrors(a, b)(input)).toEqual(expected);
    });
  });
  describe("in schema", () => {
    test.each([
      [{ num: Number }, { num: 2 }, null],
      [{ num: Number, str: String }, { num: 2, str: "str" }, null],
    ])(
      "should return null : hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toEqual(expected);
      }
    );
    test.each([
      [
        { num: Number, str: String },
        { num: "2", str: "str" },
        [
          new TypeValidationError(
            'on path /num value "2" do not match constructor Number'
          ),
        ],
      ],
      [
        { num: Number, str: String },
        { num: "2", str: null },
        [
          new TypeValidationError(
            'on path /num value "2" do not match constructor Number'
          ),
          new TypeValidationError(
            "on path /str value null do not match constructor String"
          ),
        ],
      ],
    ])(
      "should return array of errors hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toEqual(expected);
      }
    );
  });
  describe("in recursive schema", () => {
    test.each([
      [{ obj: { num: Number } }, { obj: { num: 2 } }],
      [{ obj: { num: Number, str: String } }, { obj: { num: 2, str: "str" } }],
    ])("should return null : hasErrors(%p)(%p) === %p", (schema, obj) => {
      expect(hasErrors(schema)(obj)).toEqual(null);
    });
    test.each([
      [
        { obj: { num: Number, str: String } },
        { obj: { num: "2", str: "str" } },
        [
          new TypeValidationError(
            'on path /obj/num value "2" do not match constructor Number'
          ),
        ],
      ],
      [
        {
          thr: () => {
            throw new RangeError("ups");
          },
        },
        { thr: 1 },
        [new RangeError("ups")],
      ],
      [
        { obj: { num: Number, str: String } },
        { obj: { num: "2", str: null } },
        [
          new TypeValidationError(
            'on path /obj/num value "2" do not match constructor Number'
          ),
          new TypeValidationError(
            "on path /obj/str value null do not match constructor String"
          ),
        ],
      ],
    ])(
      "should return array of errors hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toEqual(expected);
      }
    );
  });
  describe("complex schema", () => {
    const schema = {
      name: /^[a-z]{3,}$/,
      age: (age) => age > 18,
      car: {
        brand: ["honda", "toyota"],
        date: Date,
        country: {
          name: String,
        },
        [/./]: () => {
          throw new EvalError("unexpected key");
        },
      },
      optional$: true,
      [/./]: () => false,
    };
    test("should return null ", () => {
      const obj = {
        name: "garn",
        age: 19,
        optional: true,
        car: {
          brand: "honda",
          date: new Date("1982-01-01"),
          country: {
            name: "Japan",
          },
        },
      };
      expect(hasErrors(schema)(obj)).toEqual(null);
    });
    test("should return errors", () => {
      const obj = {
        name: "Garn",
        age: 18,
        optional: false,
        car: {
          brand: "Honda",
          date: "1982-01-01",
          country: {
            NAME: "Japan",
          },
          evalError: null,
        },
        noValidKey: 1,
      };
      expect(hasErrors(schema)(obj)).toEqual([
        new TypeValidationError(
          "on path /noValidKey value 1 do not match validator ()=>false"
        ),
        new TypeValidationError(
          'on path /name value "Garn" do not match regex /^[a-z]{3,}$/'
        ),
        new TypeValidationError(
          "on path /age value 18 do not match validator age=>age>18"
        ),
        new EvalError("unexpected key"),
        new TypeValidationError(
          'on path /car/brand value "Honda" do not match primitive "honda"'
        ),
        new TypeValidationError(
          'on path /car/brand value "Honda" do not match primitive "toyota"'
        ),
        new TypeValidationError(
          'on path /car/date value "1982-01-01" do not match constructor Date'
        ),
        new TypeValidationError(
          "on path /car/country/name value undefined do not match constructor String"
        ),

        new TypeValidationError(
          "on path /optional value false do not match primitive true"
        ),
      ]);
    });
  });
  describe("multiples schemas in series", () => {
    test("should return errors", () => {
      const schema1 = {
        x: Number,
      };
      const schema2 = {
        y: Boolean,
        z: Function,
      };
      const obj = {
        x: true,
        y: 1,
      };
      expect(hasErrors(schema1, schema2)(obj)).toEqual([
        new TypeValidationError(
          "on path /x value true do not match constructor Number"
        ),
        new TypeValidationError(
          "on path /y value 1 do not match constructor Boolean"
        ),
        new TypeValidationError(
          "on path /z value undefined do not match constructor Function"
        ),
      ]);
    });
  });
});

describe("isValidOrThrowAll ", () => {
  jest.spyOn(globalThis.console, "error");

  test("should throw AggregateError with all errors", () => {
    try {
      isValidOrThrowAll(Number, String)(true);
      throw "ups";
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError);
    }
    try {
      isValidOrThrowAll(Number, String)(true);

      throw "ups";
    } catch (error) {
      expect(error).not.toBeInstanceOf(TypeValidationError);
    }
  });
  test("should throw 2 errors", () => {
    try {
      isValidOrThrowAll(Number, Boolean, String)(true);
    } catch (error) {
      expect(error.errors.length).toBe(2);
    }
  });
});
describe("isValidOrLogAll", () => {
  test("should return true or false", () => {
    jest.spyOn(globalThis.console, "error");
    expect(isValidOrLogAll(Number, String)(true)).toBe(false);

    expect(isValidOrLogAll(Boolean, true)(true)).toBe(true);
  });
  test("should log 2 errors", () => {
    jest.spyOn(globalThis.console, "error");

    isValidOrLogAll(Number, Boolean, String)(true);
    expect(globalThis.console.error).toHaveBeenCalledTimes(2);
  });
  test("should log meaningful errors", () => {
    jest.spyOn(globalThis.console, "error");
    isValidOrLogAll(Number, Boolean, String)(true);

    expect(globalThis.console.error).toHaveBeenCalledWith(
      new TypeValidationError("value true do not match constructor Number")
    );
    expect(globalThis.console.error).toHaveBeenCalledWith(
      new TypeValidationError("value true do not match constructor String")
    );
  });
  test("should log meaningful errors in schemas", () => {
    jest.spyOn(globalThis.console, "error");
    isValidOrLogAll(
      { x: Number },
      { y: Boolean },
      { z: String }
    )({ x: 1, y: 2, z: 3 });

    expect(globalThis.console.error).toHaveBeenCalledWith(
      new TypeValidationError(
        "on path /y value 2 do not match constructor Boolean"
      )
    );
    expect(globalThis.console.error).toHaveBeenCalledWith(
      new TypeValidationError(
        "on path /z value 3 do not match constructor String"
      )
    );
  });
});
