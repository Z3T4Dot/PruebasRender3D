import { useState, useEffect, useCallback } from "react"
import Scene from "./canvas/Scene"
import Sidebar from "./components/Sidebar"

function App() {
  const [sceneObjects, setSceneObjects] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [error, setError] = useState(null)

  // Función para comprimir datos antes de guardar
  const compressData = useCallback((data) => {
    try {
      const compressed = data.map(obj => ({
        ...obj,
        position: obj.position.map(n => Math.round(n * 100) / 100),
        rotation: obj.rotation.map(n => Math.round(n * 100) / 100),
        scale: obj.scale.map(n => Math.round(n * 100) / 100)
      }))
      return compressed
    } catch (error) {
      console.warn('Error compressing data:', error)
      return data
    }
  }, [])

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sceneObjects')
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.every(obj => 
          obj && typeof obj === 'object' && obj.id && obj.type
        )) {
          setSceneObjects(parsed)
        } else {
          console.warn('Invalid data structure in localStorage')
          localStorage.removeItem('sceneObjects')
        }
      }
    } catch (error) {
      console.warn('Error loading from localStorage:', error)
      localStorage.removeItem('sceneObjects')
      setError('Error cargando datos guardados')
    }
  }, [])

  // Guardar en localStorage con manejo de errores mejorado
  useEffect(() => {
    if (sceneObjects.length === 0) return

    try {
      const compressed = compressData(sceneObjects)
      const dataString = JSON.stringify(compressed)
      
      if (dataString.length < 2000000) {
        localStorage.setItem('sceneObjects', dataString)
        setError(null)
      } else {
        console.warn('Data too large for localStorage, keeping only recent objects')
        const reduced = compressed.slice(-50)
        localStorage.setItem('sceneObjects', JSON.stringify(reduced))
        setError('Datos reducidos por límite de almacenamiento')
      }
    } catch (error) {
      console.warn('Error saving to localStorage:', error)
      if (error.name === 'QuotaExceededError') {
        try {
          const recent = sceneObjects.slice(-20)
          localStorage.clear()
          localStorage.setItem('sceneObjects', JSON.stringify(compressData(recent)))
          setError('Almacenamiento limpiado - solo objetos recientes guardados')
        } catch (secondError) {
          localStorage.clear()
          setError('Error de almacenamiento - datos no guardados')
        }
      }
    }
  }, [sceneObjects, compressData])

  const addObject = (type) => {
    const newObject = {
      id: Date.now(),
      type,
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: "#3b82f6"
    }
    setSceneObjects(prev => [...prev, newObject])
    setSelectedId(newObject.id)
  }

  const deleteSelected = () => {
    if (selectedId) {
      setSceneObjects(prev => prev.filter(obj => obj.id !== selectedId))
      setSelectedId(null)
    }
  }

  const duplicateSelected = () => {
    if (selectedId) {
      const selected = sceneObjects.find(obj => obj.id === selectedId)
      if (selected) {
        const duplicate = {
          ...selected,
          id: Date.now(),
          position: [
            selected.position[0] + 1,
            selected.position[1],
            selected.position[2] + 1
          ]
        }
        setSceneObjects(prev => [...prev, duplicate])
        setSelectedId(duplicate.id)
      }
    }
  }

  const exportScene = () => {
    try {
      const dataStr = JSON.stringify(sceneObjects, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'scene.json'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting scene:', error)
    }
  }

  const importScene = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      alert('Por favor selecciona un archivo JSON válido')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        
        if (!Array.isArray(imported)) {
          throw new Error('El archivo debe contener un array de objetos')
        }

        const validObjects = imported.filter(obj => {
          return obj && 
                 typeof obj === 'object' && 
                 obj.id && 
                 obj.type && 
                 Array.isArray(obj.position) && obj.position.length === 3 &&
                 Array.isArray(obj.rotation) && obj.rotation.length === 3 &&
                 Array.isArray(obj.scale) && obj.scale.length === 3 &&
                 obj.color
        })

        if (validObjects.length === 0) {
          throw new Error('No se encontraron objetos válidos en el archivo')
        }

        const processedObjects = validObjects.map((obj, index) => ({
          ...obj,
          id: Date.now() + index,
          position: obj.position.map(n => isNaN(n) ? 0 : Number(n)),
          rotation: obj.rotation.map(n => isNaN(n) ? 0 : Number(n)),
          scale: obj.scale.map(n => isNaN(n) ? 1 : Number(n))
        }))

        const dataSize = JSON.stringify(processedObjects).length
        if (dataSize > 2000000) {
          const confirmed = confirm(
            `El archivo es grande (${Math.round(dataSize/1024/1024)}MB). ` +
            'Esto podría causar problemas de rendimiento. ¿Continuar?'
          )
          if (!confirmed) {
            event.target.value = ''
            return
          }
        }

        setSceneObjects(processedObjects)
        setSelectedId(null)
        setError(null)
        
        if (validObjects.length < imported.length) {
          alert(`Se importaron ${validObjects.length} de ${imported.length} objetos. Algunos objetos tenían formato inválido.`)
        } else {
          alert(`Se importaron ${validObjects.length} objetos exitosamente.`)
        }

      } catch (error) {
        console.error('Error importing scene:', error)
        alert(`Error al importar el archivo: ${error.message}`)
        setError(`Error de importación: ${error.message}`)
      }
    }

    reader.onerror = () => {
      alert('Error al leer el archivo')
      setError('Error al leer el archivo')
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  const handleAddFurniture = (item) => {
    const newObject = {
      id: Date.now(),
      type: 'furniture',
      name: item.name,
      position: [0, item.dimensions[1] / 2, 0],
      rotation: [0, 0, 0],
      scale: item.dimensions,
      color: item.color || "#3b82f6",
      furnitureId: item.id
    }
    setSceneObjects(prev => [...prev, newObject])
    setSelectedId(newObject.id)
  }

  const handleModelImport = (modelData) => {
    const newObject = {
      id: Date.now(),
      type: 'model',
      name: modelData.name || 'Modelo Importado',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: "#3b82f6",
      modelUrl: modelData.url
    }
    setSceneObjects(prev => [...prev, newObject])
    setSelectedId(newObject.id)
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-100 to-slate-200">
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
      
      <div className="flex-1">
        <Scene 
          sceneObjects={sceneObjects}
          setSceneObjects={setSceneObjects}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
      </div>
      
      <Sidebar
        onAddObject={addObject}
        selectedId={selectedId}
        onDuplicateSelected={duplicateSelected}
        onDeleteSelected={deleteSelected}
        onExportScene={exportScene}
        onImportScene={importScene}
        onAddFurniture={handleAddFurniture}
        onModelImport={handleModelImport}
      />
    </div>
  )
}

export default App
