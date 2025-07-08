import { useState } from "react"
import FurnitureMenu from "./furnitureMenu"
import ModelImporter from "./ModelImporter"
import furnitureCatalog from "../data/furnitureCatalog.json"

export default function Sidebar({ 
  onAddObject, 
  selectedId, 
  onDuplicateSelected, 
  onDeleteSelected, 
  onExportScene, 
  onImportScene, 
  onAddFurniture, 
  onModelImport 
}) {
  return (
    <div className="w-96 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-2xl border-l border-slate-200 overflow-y-auto backdrop-blur-sm">
      <div className="p-8">
        {/* Header con diseño premium */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">Editor 3D</h1>
          <p className="text-slate-500 text-sm font-medium">Crea y edita objetos en tu escena</p>
        </div>

        {/* Objetos Básicos con diseño premium */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg font-bold">3D</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Objetos Básicos</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onAddObject('cube')}
              className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white p-6 rounded-2xl font-semibold hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl border border-blue-400/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <div className="relative flex flex-col items-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📦</div>
                <span className="text-sm font-bold">Cubo</span>
              </div>
            </button>
            <button 
              onClick={() => onAddObject('sphere')}
              className="group relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white p-6 rounded-2xl font-semibold hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl border border-emerald-400/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <div className="relative flex flex-col items-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🔵</div>
                <span className="text-sm font-bold">Esfera</span>
              </div>
            </button>
            <button 
              onClick={() => onAddObject('cylinder')}
              className="group relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white p-6 rounded-2xl font-semibold hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl border border-purple-400/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <div className="relative flex flex-col items-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🥫</div>
                <span className="text-sm font-bold">Cilindro</span>
              </div>
            </button>
            <button 
              onClick={() => onAddObject('cone')}
              className="group relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white p-6 rounded-2xl font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl border border-orange-400/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <div className="relative flex flex-col items-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🔺</div>
                <span className="text-sm font-bold">Cono</span>
              </div>
            </button>
          </div>
        </div>

        {/* Objeto Seleccionado con diseño premium */}
        {selectedId && (
          <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200/50 rounded-2xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-lg">✨</span>
              </div>
              <h4 className="text-lg font-bold text-amber-800">Objeto Seleccionado</h4>
            </div>
            <div className="space-y-3">
              <button 
                onClick={onDuplicateSelected}
                className="w-full bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-2 text-lg">📋</span>
                Duplicar Objeto
              </button>
              <button 
                onClick={onDeleteSelected}
                className="w-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:via-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-2 text-lg">🗑️</span>
                Eliminar Objeto
              </button>
            </div>
          </div>
        )}

        {/* Archivo con diseño premium */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">📁</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Archivo</h3>
          </div>
          <div className="space-y-4">
            <button 
              onClick={onExportScene}
              className="w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-indigo-600 hover:via-indigo-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <span className="mr-3 text-lg">💾</span>
              Exportar Escena
            </button>
            <label className="w-full bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-yellow-600 hover:via-yellow-700 hover:to-yellow-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center">
              <span className="mr-3 text-lg">📤</span>
              Importar Escena
              <input
                type="file"
                accept=".json"
                onChange={onImportScene}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Catálogo de muebles con diseño premium */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">🏠</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Catálogo</h3>
          </div>
          <FurnitureMenu 
            catalog={furnitureCatalog} 
            onAdd={onAddFurniture} 
          />
        </div>

        {/* Importador de modelos con diseño premium */}
        <div className="mb-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">🎨</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Modelos 3D</h3>
          </div>
          <ModelImporter onImport={onModelImport} />
        </div>
      </div>
    </div>
  )
}
