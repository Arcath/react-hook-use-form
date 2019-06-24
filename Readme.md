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
|clear|`() => void`|Function that sets the form back to its initial value.|
|controlledInput|`(fieldName: keyof T) => ControlledInput`|Function that is used to create input fields (See Creating your own input).|
|data|`T`|The current state of the form.|
|onSubmit|`(handler: (data: T) => void) => void`|A function which takes a callback to be used when the form is submitted.|
|validate|`(field: keyof T, validator: (value: any) => boolean) => void`|A function that takes the field name and validation function as arguments.|
|valid|`(field?: keyof T) => boolean`|A function that checks the validity of one field or the whole form and returns a boolean value.|

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

