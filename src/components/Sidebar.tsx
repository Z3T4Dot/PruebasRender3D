// src/components/Sidebar.tsx
import React, { useState, useMemo } from "react";
import catalog from "../data/furnitureCatalog.json";  // Asegúrate de que esta ruta es correcta

interface CatalogItem {
  id: string;
  name: string;
  dimensions: [number, number, number];
  color: string;
}

interface SidebarProps {
  onAddObject: (type: string) => void;
  onExportScene: () => void;
  onImportScene: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddFurniture: (item: CatalogItem) => void;
  onModelImport: (data: { url: string; name: string }) => void;
  selectedId: number | null;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
}

export default function Sidebar({
  onAddObject,
  onExportScene,
  onImportScene,
  onAddFurniture,
  onModelImport,
  selectedId,
  onDuplicateSelected,
  onDeleteSelected,
}: SidebarProps) {
  const [search, setSearch] = useState<string>("");

  // Filtra el catálogo según búsqueda
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return catalog.filter((item: CatalogItem) =>
      item.name.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <aside className="sidebar">
      <section className="panel">
        <h2>Archivo</h2>
        <button onClick={onExportScene} className="btn btn-ghost full">
          Exportar escena
        </button>
        <label className="btn btn-ghost full">
          Importar escena
          <input
            type="file"
            accept=".json"
            onChange={onImportScene}
            hidden
          />
        </label>
      </section>

      <section className="panel">
        <h2>Catálogo</h2>
        <input
          className="input"
          placeholder="Buscar muebles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="catalog-list">
          {filtered.map((item: CatalogItem) => (
            <button
              key={item.id}
              onClick={() => onAddFurniture(item)}
              className="btn btn-link full"
            >
              {item.name} (
              {item.dimensions.map((d) => `${d}m`).join("×")})
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="no-results">No se encontraron muebles.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Modelos 3D</h2>
        <label className="btn btn-outline full">
          Importar GLTF
          <input
            type="file"
            accept=".glb,.gltf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onModelImport({ url: URL.createObjectURL(f), name: f.name });
            }}
            hidden
          />
        </label>
      </section>

      <section className="panel">
        <h2>Objeto Seleccionado</h2>
        <button
          onClick={onDuplicateSelected}
          disabled={!selectedId}
          className="btn btn-secondary full"
        >
          Duplicar
        </button>
        <button
          onClick={onDeleteSelected}
          disabled={!selectedId}
          className="btn btn-danger full"
        >
          Eliminar
        </button>
      </section>
    </aside>
);
}
