import React from "react"
import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

export default function ModelImporter({ onImport }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = function (event) {
      const arrayBuffer = event.target.result
      const loader = new GLTFLoader()
      loader.parse(arrayBuffer, "", (gltf) => {
        onImport(gltf)
      })
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div>
      <label 
        htmlFor="model-upload" 
        className="group w-full bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white p-6 rounded-xl font-semibold hover:from-pink-600 hover:via-pink-700 hover:to-pink-800 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer flex items-center justify-center border border-pink-400/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
        <div className="relative flex items-center">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
            <span className="text-white text-2xl group-hover:scale-110 transition-transform duration-300">📁</span>
          </div>
          <div className="text-left">
            <div className="font-bold text-white text-lg">Importar Modelo 3D</div>
            <div className="text-pink-100 text-sm font-medium">Archivos .glb y .gltf compatibles</div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <span className="text-white/70 text-lg group-hover:text-white group-hover:translate-x-1 transition-all duration-300">→</span>
          </div>
        </div>
      </label>
      <input
        id="model-upload"
        type="file"
        accept=".glb,.gltf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
