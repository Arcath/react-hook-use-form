import {useReducer, useRef} from 'react'

export interface FormHookOutput<T>{
  /** Reset the form to its initial values */
  clear: () => void

  /**
   * Returns an object of functions to be used with an input, see `ControlledInput`
   */
  controlledInput: <K extends keyof T>(field: K) => ControlledInput<T, K>

  /** The current data object */
  data: T

  /**
   * The function passed as a callback will be called when the form is submitted. 
   * 
   * @param cb Callback function that is passed the current data object when the form is submitted.
   */
  onSubmit: (cb: (data: T) => void) => void

  /**
   * Defines a validator for the form
   * 
   * @param field The field to validate.
   * @param validator The function to validate the field, should return a boolean for valid status.
   */
  validate: <K extends keyof T>(field: K, validator: (value: T[K], data: T) => boolean) => void

  /**
   * Check the validation status of the form or field.
   * 
   * @param field (Optional), if supplied the validation status of the given field will be returned, otherwise the whole forms status will be returned.
   */
  valid: (field?: keyof T) => boolean,

  /**
   * Bind to a field, used to quickly setup <input> tags
   * 
   * @param field The field to bind this input to.
   */
  bind: <K extends keyof T>(field: K) => ControlledInput<T, K>["bind"]

  /**
   * Binds the form to `useForm`.
   * 
   * Use as `<form {...formBind()}>`
   */
  formBind: () => {
    onSubmit: (e: any) => void
  }

  /**
   * Set the data to the supplied data.
   * 
   * @param data The new data object to use.
   */
  set: (data: Partial<T>) => void

  /**
   * Returns the required fields for a label.
   */
  label: <K extends keyof T>(field: K) => {for: string}

  /**
   * Has the value changed from its original.
   * 
   * @param field (Optional) limit search to a single field.
   */
  changed: (field?: keyof T) => boolean
}

export interface ControlledInput<T, K extends keyof T = keyof T>{
  /** The field controlled by these functions. */
  field: K

  /** The fields current value. */
  value: T[K]

  /** Set the fields value to the supplied value. */
  update: (newValue: T[K]) => void

  /** Is the current field value valid? */
  valid: () => boolean,

  /** Bind to an input */
  bind: {
    value: T[K]
    onChange: (e: any) => void
    name: K
    'aria-label': string
    id: string
  }
}

interface DispatchAction<T, K extends keyof T = keyof T>{
  field: K
  value: T[K]
}

export interface UseFormOptions{
  ariaModel: string
}

export function useForm<T>(initialData: T, options?: UseFormOptions): FormHookOutput<T>{
  const [data, dispatchData] = useReducer<React.Reducer<T, DispatchAction<T>>>((state, action) => {
    let newState = {...state}

    newState[action.field] = action.value

    return newState
  }, initialData)

  const originalData = {...initialData}

  const staticFunctions = useRef({
    set: (data: Partial<T>) => {
      Object.keys(data).forEach((field) => {
        dispatchData({field: (field as keyof T), value: data[field]})
      })
    },
    clear: () => {
      Object.keys(initialData).forEach((field) => {
        dispatchData({field: (field as keyof T), value: initialData[field]})
      })
    }
  })

  /** The default onSubmit, this is so we can overwrite it when the user calls `onSubmit` */
  let onSubmitCallback = (data: T) => {
    // NOOP
  }

  let validators: {[field: string]: (value: any, data: T) => boolean} = {}

  Object.keys(data).forEach((key) => {
    validators[key] = () => true
  })

  const controlledInput = <K extends keyof T>(field: K): ControlledInput<T, K> => {
    const update = (value: T[K]) => {
      dispatchData({field, value})
    }

    const valid = () => validators[field as string](data[field], data)

    const ariaLabel = options && options.ariaModel ? `${options.ariaModel}-${field}` : `${field}`

    return {
      field,
      value: data[field],
      update,
      valid,
      bind: {
        value: data[field],
        name: field,
        onChange: (e) => update((e.target as any).value),
        'aria-label': ariaLabel,
        id: ariaLabel
      }
    }
  }

  const onSubmit = (cb: (data: T) => void) => {
    onSubmitCallback = cb
  }

  const validate = (field: keyof T, validator: (value: any, data: T) => boolean) => {
    validators[field as string] = validator
  }

  const valid = (field?: keyof T) => {
    if(field){
      return validators[(field as string)](data[field], data)
    }

    return Object.keys(data).reduce((acc, key) => {
      return acc && validators[key]((data as any)[key] as any, data)
    }, true)
  }

  const bind = <K extends keyof T>(field: K) => {
    return controlledInput(field).bind
  }

  const label = <K extends keyof T>(field: K) => {
    const id = options && options.ariaModel ? `${options.ariaModel}-${field}` : `${field}`
    
    return {
      for: id
    }
  }

  const formBind = () => {
    return {
      onSubmit: (e: any) => {
        e.preventDefault()
        onSubmitCallback(data)
      }
    }
  }

  const changed = (field?: keyof T): boolean => {
    if(field){
      console.dir(originalData)

      return originalData[field] !== data[field]
    }

    return Object.keys(data).reduce((changed, field) => {
      if(changed){
        return changed
      }

      return originalData[field] !== data[field]
    }, false)
  }

  return {
    clear: staticFunctions.current.clear,
    controlledInput,
    data,
    onSubmit,
    validate,
    valid,
    bind,
    formBind,
    set: staticFunctions.current.set,
    label,
    changed
  }
}