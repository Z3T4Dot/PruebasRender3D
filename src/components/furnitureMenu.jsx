import React, { useState } from "react"

export default function FurnitureMenu({ catalog, onAdd }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCatalog = catalog.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="furniture-menu">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar muebles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 text-sm bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all duration-300 shadow-sm hover:shadow-md font-medium placeholder-slate-400"
          />
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredCatalog.length > 0 ? (
          filteredCatalog.map((item) => (
            <button
              key={item.id}
              onClick={() => onAdd(item)}
              className="group w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white p-4 rounded-xl font-semibold hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-400/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-lg group-hover:scale-110 transition-transform duration-300">➕</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="text-sm text-emerald-100 font-medium">
                    {item.dimensions[0]}×{item.dimensions[1]}×{item.dimensions[2]}m
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No se encontraron muebles</p>
            <p className="text-slate-400 text-sm mt-1">Intenta con otro término de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
