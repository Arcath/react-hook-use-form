import React, {useState} from 'react'

export interface FormHookOutput<T>{
  clear: () => void
  controlledInput: (field: keyof T) => ControlledInput<T>
  data: T
  Form: React.FunctionComponent
  Input: React.FunctionComponent<{field: keyof T}>
  onSubmit: (cb: (data: T) => void) => void
  validate: (field: keyof T, validator: (value: any) => boolean) => void
  valid: () => boolean
}

export interface ControlledInput<T>{
  field: keyof T
  value: any
  update: (newValue: any) => void
  valid: () => boolean,
  bind: {
    value: any
    onChange: (e: any) => void
  }
}

export function useForm<T>(initialData: T): FormHookOutput<T>{
  const [data, setData] = useState(initialData)

  /** The default onSubmit, this is so we can overwrite it when the user calls `onSubmit` */
  let onSubmitCallback = (data: T) => {
    // NOOP
  }

  let validators: {[field: string]: (value: any) => boolean} = {}

  Object.keys(data).forEach((key) => {
    validators[key] = () => true
  })

  const clear = () => {
    setData(initialData)
  }

  const controlledInput = (field: keyof T): ControlledInput<T> => {
    const update = (newValue: any) => {
      const tempData = Object.assign({}, data)
      tempData[field] = newValue

      setData(tempData)
    }

    const valid = () => validators[field as string](data[field])

    return {
      field,
      value: data[field],
      update,
      valid,
      bind: {
        value: data[field],
        onChange: (e) => update((e.target as any).value)
      }
    }
  }

  const Form: React.FunctionComponent = ({children}) => {
    return <form onSubmit={(e) => {
      e.preventDefault()
      onSubmitCallback(data)
    }}>
      {children}
    </form>
  }

  const Input: React.FunctionComponent<{field: keyof T}> = ({field}) => {
    const {bind} = controlledInput(field)

    return <input {...bind} name={field as string} />
  }

  const onSubmit = (cb: (data: T) => void) => {
    onSubmitCallback = cb
  }

  const validate = (field: keyof T, validator: (data: any) => boolean) => {
    validators[field as string] = validator
  }

  const valid = () => {
    return Object.keys(data).map((key) => {
      return validators[key](data[key])
    }).reduce((acc, result) => {
      return acc && result
    })
  }

  return {
    clear,
    controlledInput,
    data,
    Form,
    Input,
    onSubmit,
    validate,
    valid
  }
}