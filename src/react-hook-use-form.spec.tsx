import React, {useEffect} from 'react'
import {configure, mount} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

import {useForm} from './react-hook-use-form'

describe('React Form Hooks', () => {
  it('should function as a controlled form', () => {
    let pass = false

    const Component: React.FunctionComponent = () => {
      const {bind, formBind, onSubmit, controlledInput} = useForm({
        name: '',
        age: 10
      })

      onSubmit((data) => {
        expect(data.name).toBe('test')
        expect(data.age).toBe(10)
        pass = true
      })

      // This is to test Typescript.
      // `value` should have the type number
      const {value, update} = controlledInput('age')

      return <form {...formBind()}>
        <input {...bind('name')} id="name"/>
        <input value={value} onChange={(e) => {update(parseInt(e.target.value))}} />
      </form>
    }

    const wrapper = mount(<Component />)

    const input = wrapper.find('input#name')

    expect(input.length).toBe(1)
    
    input.simulate('change', {target: {value: 'test'}})

    const form = wrapper.find('form')
    form.simulate('submit', {preventDefault: () => {}})

    expect(pass).toBe(true)
  })

  it('should validate input', () => {
    let pass = false

    const Component = () => {
      const {formBind, bind, onSubmit, validate, valid} = useForm({
        name: '',
        email: ''
      })

      validate('name', (value) => {
        pass = true
        return value === 'pass'
      })

      validate('email', () => {
        return true
      })

      onSubmit((data) => {
        expect(data.name).toBe('pass')
        expect(data.email).toBe('pass@test.com')
      })

      return <form {...formBind()}>
        <input {...bind('name')} />
        <input {...bind('email')} />
        <b>{valid() ? 'valid' : 'invalid'}</b>
        <i>{valid('email') ? 'valid' : 'invalid'}</i>
      </form>
    }

    const wrapper = mount(<Component />)

    const invalid = wrapper.find('b')
    expect(invalid.html()).toBe('<b>invalid</b>')

    const name = wrapper.find('input[name="name"]')
    name.simulate('change', {target: {value: 'pass'}})

    const valid = wrapper.find('b')
    expect(valid.html()).toBe('<b>valid</b>')

    const emailValid = wrapper.find('i')
    expect(emailValid.html()).toBe('<i>valid</i>')
    
    const email = wrapper.find('input[name="email"]')
    email.simulate('change', {target: {value: 'pass@test.com'}})

    const form = wrapper.find('form')
    form.simulate('submit', {preventDefault: () => {}})
    
    expect(pass).toBe(true)
  })

  it('should function support set and a clear', () => {
    let pass = false
    const btnSet = "Set"

    const Component: React.FunctionComponent = () => {
      const {bind, formBind, onSubmit, set, clear} = useForm({
        name: '',
        age: 10
      })

      onSubmit((data) => {
        expect(data.name).toBe('set')
        expect(data.age).toBe(10)
        pass = true
        clear()
      })

      return <form {...formBind()}>
        <input {...bind('name')}/>
        <button onClick={() => {
          set({name: 'set'})
        }}>{btnSet}</button>
      </form>
    }

    const wrapper = mount(<Component />)

    const input = wrapper.find('input')

    expect(input.length).toBe(1)
    
    input.simulate('change', {target: {value: 'test'}})

    const button = wrapper.find('button')

    button.simulate('click')

    const form = wrapper.find('form')
    form.simulate('submit', {preventDefault: () => {}})

    expect(pass).toBe(true)

    const input2 = wrapper.find('input')

    expect(input2.length).toBe(1)

    expect(input2.html()).toBe('<input name="name" aria-label="name" value="">')
  })

  it('should supply set etc.. in a stable way', () => {
    const TEST_STRING = "test"

    let runCount = 0

    const Component: React.FunctionComponent = () => {
      const {set, formBind, onSubmit} = useForm({
        title: ''
      })

      useEffect(() => {
        set({
          title: TEST_STRING
        })

        runCount++
      }, [set])

      onSubmit(({title}) => {
        expect(title).toBe(TEST_STRING)
      })

      return <>
        <form {...formBind()} />
      </>
    }

    const wrapper = mount(<Component />)

    const form = wrapper.find('form')
    form.simulate('submit', {preventDefault: () => {}})

    expect(runCount).toBe(1)
  })

  it('should support `ariaModel`', () => {
    const Component: React.FunctionComponent = () => {
      const {bind, formBind, onSubmit, controlledInput} = useForm({
        name: '',
        age: 10
      }, {ariaModel: 'person'})

      onSubmit((data) => {
        expect(data.name).toBe('test')
        expect(data.age).toBe(10)
      })

      // This is to test Typescript.
      // `value` should have the type number
      const {value, update} = controlledInput('age')

      return <form {...formBind()}>
        <input {...bind('name')} id="name"/>
        <input value={value} onChange={(e) => {update(parseInt(e.target.value))}} />
      </form>
    }

    const wrapper = mount(<Component />)

    const input = wrapper.find('input#name')

    expect(input.html()).toBe('<input name="name" aria-label="person-name" id="name" value="">')
  })
})