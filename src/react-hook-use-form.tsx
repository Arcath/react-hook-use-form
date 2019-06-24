import {useState} from 'react'

export interface FormHookOutput<T>{
  clear: () => void
  controlledInput: (field: keyof T) => ControlledInput<T>
  data: T
  onSubmit: (cb: (data: T) => void) => void
  validate: (field: keyof T, validator: (value: any) => boolean) => void
  valid: (field?: keyof T) => boolean,
  bind: (field: keyof T) => ControlledInput<T>["bind"]
  formBind: () => {
    onSubmit: (e: any) => void
  }
}

export interface ControlledInput<T>{
  field: keyof T
  value: any
  update: (newValue: any) => void
  valid: () => boolean,
  bind: {
    value: any
    onChange: (e: any) => void
    name: keyof T
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
    setData(initialData as any)
  }

  const controlledInput = (field: keyof T): ControlledInput<T> => {
    const update = (newValue: any) => {
      const tempData = Object.assign({}, data)
      tempData[field] = newValue

      setData(tempData as any)
    }

    const valid = () => validators[field as string](data[field])

    return {
      field,
      value: data[field],
      update,
      valid,
      bind: {
        value: data[field],
        name: field,
        onChange: (e) => update((e.target as any).value)
      }
    }
  }

  const onSubmit = (cb: (data: T) => void) => {
    onSubmitCallback = cb
  }

  const validate = (field: keyof T, validator: (data: any) => boolean) => {
    validators[field as string] = validator
  }

  const valid = (field?: keyof T) => {
    if(field){
      return validators[(field as string)](data[field])
    }

    return Object.keys(data).map((key) => {
      return validators[key]((data as any)[key] as any)
    }).reduce((acc, result) => {
      return acc && result
    })
  }

  const bind = (field: keyof T) => {
    return controlledInput(field).bind
  }

  const formBind = () => {
    return {
      onSubmit: (e: any) => {
        e.preventDefault()
        onSubmitCallback(data)
      }
    }
  }

  return {
    clear,
    controlledInput,
    data,
    onSubmit,
    validate,
    valid,
    bind,
    formBind
  }
}