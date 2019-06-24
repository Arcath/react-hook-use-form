import React from 'react'
import {configure, mount} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

import {useForm} from './react-hook-use-form'

describe('React Form Hooks', () => {
  it('should function as a controlled form', () => {
    let pass = false

    const Component: React.FunctionComponent = () => {
      const {bind, formBind, onSubmit} = useForm({
        name: ''
      })

      onSubmit((data) => {
        expect(data.name).toBe('test')
        pass = true
      })

      return <form {...formBind()}>
        <input {...bind('name')}/>
      </form>
    }

    const wrapper = mount(<Component />)

    const input = wrapper.find('input')

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

      onSubmit((data) => {
        expect(data.name).toBe('pass')
        expect(data.email).toBe('pass@test.com')
      })

      return <form {...formBind()}>
        <input {...bind('name')} />
        <input {...bind('email')} />
        <b>{valid() ? 'valid' : 'invalid'}</b>
      </form>
    }

    const wrapper = mount(<Component />)

    const invalid = wrapper.find('b')
    expect(invalid.html()).toBe('<b>invalid</b>')

    const name = wrapper.find('input[name="name"]')
    name.simulate('change', {target: {value: 'pass'}})

    const valid = wrapper.find('b')
    expect(valid.html()).toBe('<b>valid</b>')
    
    const email = wrapper.find('input[name="email"]')
    email.simulate('change', {target: {value: 'pass@test.com'}})

    const form = wrapper.find('form')
    form.simulate('submit', {preventDefault: () => {}})
    
    expect(pass).toBe(true)
  })
})