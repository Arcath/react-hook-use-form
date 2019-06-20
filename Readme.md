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
  const {Form, Input, onSubmit} = useForm({
    name: '',
    email: ''
  })

  onSubmit((data) => {
    // `data` is the forms state when it was submitted
    doSignup(data.name, data.email)
  })

  return <Form>
    <Input field="name" />
    <Input field="email" />
    <input type="submit" value="Sign Up!" />
  </Form>
}
```

`useForm`s output is an object with this structure:

|property|value|
|:-------|:----|
|clear|Function that sets the form back to its initial value.|
|controlledInput|Function that is used to create input fields (See Creating your own input).|
|data|The current state of the form.|
|Form|A `<form>` with the event handlers setup on it.|
|Input|An `<input>` with the event and valud handlers setup on it.|
|onSubmit|A function which takes a callback to be used when the form is submitted.|
|validate|A function that takes the field name and validation function as arguments.|
|valid|A function that checks the validity of the whole form and returns a boolean value.|

### Validation

Validating fields with `useForm` is easy. Going back to the earlier example, lets ensure that the email contains an `@`

```tsx
const NewsletterSignUp: React.FunctionComponent = () => {
  const {Form, Input, onSubmit, validate} = useForm({
    name: '',
    email: ''
  })

  validate('email', (value) => {
    return value.indexOf('@') > -1
  })

  //...
}
```

### Creating you own Input

`useForm` can be used to create any kind of input.

Lets say we want the email field to have red text when it is invalid:

```tsx
const NewsletterSignUp: React.FunctionComponent = () => {
  const {Form, Input, onSubmit, validate, controlledInput} = useForm({
    name: '',
    email: ''
  })

  validate('email', (value) => {
    return value.indexOf('@') > -1
  })

  const EmailInput: React.FunctionComponent = () => {
    const {bind, valid} = controlledInput('email')

    return <input {...bind} style={{color: valid() ? '#000' : '#f00'}} />
  }

  //...

  return <Form>
    <Input field="name" />
    <EmailInput />
  </Form>
}
```

This could be generalised by taking the field name as a prop.

### Supplying inputs from a hook

To create `controlledInput`s the specific `controlledInput` for the form needs to be used, this makes the best way to share form components a hook.

```tsx
import {ControlledInput} from 'react-hook-use-form'

// This ia function not an arrow function because of JSX and trying to provide a generic.
function useFormComponents<T>(controlledInput: (field: keyof T) => ControlledInput<T>){
  const Text: React.FunctionComponent<{field: keyof T}> = ({field}) => {
    const {bind} = controlledInput(field)

    // where <Input /> is a styled component etc...
    return <Input {...bind} />
  }

  const Password: React.FunctionComponent<{field: keyof T}> = ({field}) => {
    const {bind} = controlledInput(field)

    // where <Input /> is a styled component etc...
    return <Input {...bind} type="password" />
  }

  return {Text, Password}
}
```

And then in your component:

```tsx
const NewsletterSignUp: React.FunctionComponent = () => {
  const {Form, onSubmit, controlledInput} = useForm({
    name: '',
    email: ''
  })
  const {Text} = useFormComponent(controlledInput)

  onSubmit((data) => {
    // `data` is the forms state when it was submitted
    doSignup(data.name, data.email)
  })

  return <Form>
    <Text field="name" />
    <Text field="email" />
    <input type="submit" value="Sign Up!" />
  </Form>
}
```