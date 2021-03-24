# React Hook useForm

`useForm` provides an interface around an object for use in forms.

## Install

```bash
npm install --save react-hook-use-form
```

## Usage

> The best `useForm` experiance comes when using Typescript.

Lets say you want to collect a users name and email for a newsletter form.

```tsx
const NewsletterSignUp: React.FunctionComponent = () => {
  const {formBind, bind, onSubmit} = useForm({
    name: '',
    email: ''
  })

  onSubmit((data) => {
    // `data` is the forms state when it was submitted
    doSignup(data.name, data.email)
  })

  return <form {...formBind()}>
    <input {...bind('name')} />
    <input {...bind('email')} />
    <input type="submit" value="Sign Up!" />
  </Form>
}
```

`useForm`s output is an object with this structure:

|property|type|value|
|:-------|:----|:----|
|bind|`(field: keyof T) => {value, onChange, name}`|Used to bind to a single field.|
|clear|`() => void`|Function that sets the form back to its initial value.|
|controlledInput|`(fieldName: keyof T) => ControlledInput`|Function that is used to create input fields (See Creating your own input).|
|data|`T`|The current state of the form.|
|formBind|`() => {onSumbit}`|Used to bind a forms submit action to `useForm`|
|onSubmit|`(handler: (data: T) => void) => void`|A function which takes a callback to be used when the form is submitted.|
|validate|`(field: keyof T, validator: (value: any) => boolean) => void`|A function that takes the field name and validation function as arguments.|
|valid|`(field?: keyof T) => boolean`|A function that checks the validity of one field or the whole form and returns a boolean value.|
|set|`(data: T) => void`|Function to set the `data` to a given value. Useful if you want to use one form to edit multiple entries.|
|label|`(field: keyof T) => {for}|Returns the fields label `for`.|
|changed|`(field?: keyof T) => boolean`|Has the given field, or any field changed from the intial data.|

### Validation

Validating fields with `useForm` is easy. Going back to the earlier example, lets ensure that the email contains an `@`

```tsx
const NewsletterSignUp: React.FunctionComponent = () => {
  const {valid, bind, formBind, validate} = useForm({
    name: '',
    email: ''
  })

  validate('email', (value) => {
    return value.indexOf('@') > -1
  })

  return <form {...formBind()}>
    <input {...bind('name')} style={{color: valid('name') ? '#000' : '#f00'}} />
    <input {...bind('email')} style={{color: valid('email') ? '#000' : '#f00'}} />
    <input type="submit" value="Subscribe" disabled={!valid()} />
  </form>
}
```

## Creating your own input

Sometimes simply using `bind` wont work as your not using and `input` and you want to have a custom input.

`useForm` returns a function of `controlledInput` which gives more control over a single field.

`controlledInput` returns the following:

|property|type|value|
|:-------|:----|:----|
|field|`keyof T`|The current field|
|value|`T[field]`|The current value (connected to state)|
|update|`(newValue: T[field]) => void`|Change the value to the supplied value|
|valid|`() => boolean`|Returns a boolean value for the fields current validity|
|bind|`{value, onChange, name}`|The same as if you had called `bind(field)` directly from `useForm`|
|id|`string`|The id of the input.|