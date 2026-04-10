import { useState } from 'react'
import ResourceForm from './components/resources/ResourceForm'
import './App.css'

function App() {
  const handleSubmit = (formData) => {
    console.log('Form submitted:', formData)
    alert('Resource submitted: ' + JSON.stringify(formData))
  }

  return (
    <div className="app">
      <h1>Resource Management - Add Resource</h1>
      <ResourceForm 
        onSubmit={handleSubmit}
        submitLabel="Add Resource"
      />
    </div>
  )
}

export default App
