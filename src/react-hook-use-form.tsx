import {useState} from 'react'

export interface FormHookOutput<T>{
  clear: () => void
  controlledInput: <K extends keyof T>(field: K) => ControlledInput<T, K>
  data: T
  onSubmit: (cb: (data: T) => void) => void
  validate: (field: keyof T, validator: (value: any) => boolean) => void
  valid: (field?: keyof T) => boolean,
  bind: (field: keyof T) => ControlledInput<T>["bind"]
  formBind: () => {
    onSubmit: (e: any) => void
  }
  set: (data: T) => void
}

export interface ControlledInput<T, K extends keyof T = keyof T>{
  field: K
  value: T[K]
  update: (newValue: T[K]) => void
  valid: () => boolean,
  bind: {
    value: T[K]
    onChange: (e: any) => void
    name: K
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

  const controlledInput = <K extends keyof T>(field: K): ControlledInput<T, K> => {
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

    return Object.keys(data).reduce((acc, key) => {
      return acc && validators[key]((data as any)[key] as any)
    }, true)
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

  const set = (data: T) => {
    setData(data)
  }

  return {
    clear,
    controlledInput,
    data,
    onSubmit,
    validate,
    valid,
    bind,
    formBind,
    set
  }
}