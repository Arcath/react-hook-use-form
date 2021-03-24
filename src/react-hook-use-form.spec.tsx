import React, { useEffect } from "react";
import { fireEvent, render } from "@testing-library/react";

import { useForm } from "./react-hook-use-form";

describe("React Form Hooks", () => {
  it("should function as a controlled form", () => {
    let pass = false;

    const Component: React.FunctionComponent = () => {
      const { bind, formBind, onSubmit, controlledInput, changed } = useForm({
        name: "",
        age: 10,
      });

      onSubmit((data) => {
        expect(data.name).toBe("test");
        expect(data.age).toBe(10);
        expect(changed('age')).toBe(false);
        expect(changed('name')).toBe(true);
        expect(changed()).toBe(true);
        pass = true;
      });

      // This is to test Typescript.
      // `value` should have the type number
      const { value, update } = controlledInput("age");

      return (
        <form {...formBind()}>
          <input {...bind("name")} id="name" />
          <input
            value={value}
            onChange={(e) => {
              update(parseInt(e.target.value));
            }}
          />
          <input type="submit" value="submit" />
        </form>
      );
    };

    const { container, getByLabelText, getByText } = render(<Component />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <form>
          <input
            aria-label="name"
            id="name"
            name="name"
            value=""
          />
          <input
            value="10"
          />
          <input
            type="submit"
            value="submit"
          />
        </form>
      </div>
    `);

    const input = getByLabelText("name");

    fireEvent.change(input, { target: { value: "test" } });

    const submitButton = getByText("submit");

    fireEvent.click(submitButton);

    expect(pass).toBe(true);
  });

  it("should validate input", () => {
    //let pass = false

    const Component = () => {
      const { formBind, bind, validate, valid } = useForm({
        name: "",
        email: "",
      });

      validate("name", (value) => {
        //pass = true
        return value === "pass";
      });

      validate("email", () => {
        return true;
      });

      return (
        <form {...formBind()}>
          <input {...bind("name")} />
          <input {...bind("email")} />
          <b>{valid() ? "valid" : "invalid"}</b>
          <i>{valid("email") ? "valid" : "invalid"}</i>
        </form>
      );
    };

    const { container, getByLabelText } = render(<Component />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <form>
          <input
            aria-label="name"
            id="name"
            name="name"
            value=""
          />
          <input
            aria-label="email"
            id="email"
            name="email"
            value=""
          />
          <b>
            invalid
          </b>
          <i>
            valid
          </i>
        </form>
      </div>
    `);

    const nameInput = getByLabelText("name");
    //const emailInput = getByLabelText('email')

    fireEvent.change(nameInput, { target: { value: "pass" } });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <form>
          <input
            aria-label="name"
            id="name"
            name="name"
            value="pass"
          />
          <input
            aria-label="email"
            id="email"
            name="email"
            value=""
          />
          <b>
            valid
          </b>
          <i>
            valid
          </i>
        </form>
      </div>
    `);
  });

  it("should function support set and a clear", () => {
    let pass = false;
    const btnSet = "Set";

    const Component: React.FunctionComponent = () => {
      const { bind, formBind, onSubmit, set, clear } = useForm({
        name: "",
        age: 10,
      });

      onSubmit((data) => {
        expect(data.name).toBe("set");
        expect(data.age).toBe(10);
        pass = true;
        clear();
      });

      return (
        <form {...formBind()}>
          <input {...bind("name")} />
          <button
            onClick={(e) => {
              e.preventDefault();
              set({ name: "set" });
            }}
          >
            {btnSet}
          </button>
          <input type="submit" value="submit" />
        </form>
      );
    };

    const { container, getByText, getByLabelText } = render(<Component />);

    const setButton = getByText(btnSet);
    const nameInput = getByLabelText("name");
    const submitButton = getByText("submit");

    fireEvent.change(nameInput, { target: { value: "new name" } });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <form>
          <input
            aria-label="name"
            id="name"
            name="name"
            value="new name"
          />
          <button>
            Set
          </button>
          <input
            type="submit"
            value="submit"
          />
        </form>
      </div>
    `);

    fireEvent.click(setButton);

    fireEvent.click(submitButton);

    expect(pass).toBe(true);
  });

  it("should supply set etc.. in a stable way", () => {
    const TEST_STRING = "test";

    let runCount = 0;

    const Component: React.FunctionComponent = () => {
      const { set, formBind, onSubmit, changed } = useForm({
        title: "",
      });

      useEffect(() => {
        set({
          title: TEST_STRING,
        });

        runCount++;
      }, [set]);

      onSubmit(({ title }) => {
        expect(changed('title')).toBe(true);
        expect(title).toBe(TEST_STRING);
      });

      return (
        <>
          <form {...formBind()}>
            <input type="submit" value="submit" />
          </form>
        </>
      );
    };

    const { getByText } = render(<Component />);

    const submitButton = getByText("submit");

    fireEvent.click(submitButton);

    expect(runCount).toBe(1);
  });

  it("should support `ariaModel`", () => {
    const Component: React.FunctionComponent = () => {
      const { bind, formBind, onSubmit, controlledInput, label } = useForm(
        {
          name: "",
          age: 10,
        },
        { ariaModel: "person" }
      );

      onSubmit((data) => {
        expect(data.name).toBe("test");
        expect(data.age).toBe(10);
      });

      // This is to test Typescript.
      // `value` should have the type number
      const { value, update } = controlledInput("age");

      return (
        <form {...formBind()}>
          <label {...label('name')}>Name:</label>
          <input {...bind("name")} id="name" />
          <input
            value={value}
            onChange={(e) => {
              update(parseInt(e.target.value));
            }}
          />
        </form>
      );
    };

    const { getByLabelText } = render(<Component />);

    const input = getByLabelText("person-name");

    expect(input).not.toBeNull();
  });
});
