import { useState } from 'react'
import reactLogo from './assets/react.svg'
import Dashboard from './pages/Dashboard'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Dashboard/>
    </>
  )
}

export default App
