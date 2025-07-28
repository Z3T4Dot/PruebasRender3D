import React, { useState, useEffect, useCallback } from 'react';
import { RoomSetup } from './components/RoomSetup';
import Scene from './canvas/Scene';
import Sidebar from './components/Sidebar';
import './App.css';

// Tipos para la configuración de la habitación
interface WallsConfig { north: boolean; south: boolean; east: boolean; west: boolean; }
interface FloorDims { width: number; depth: number; }
interface RoomConfig {
  walls: WallsConfig;
  floorDims: FloorDims;
  wallColor: string;
  floorTexture: string;
}

const App: React.FC = () => {
  // 1) Configuración de la habitación
  const [config, setConfig] = useState<RoomConfig | null>(null);
  
  // 2) Estado de la escena
  const [sceneObjects, setSceneObjects] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Comprimir para localStorage
  const compressData = useCallback((data: any[]) => {
    try {
      return data.map(obj => ({
        ...obj,
        position: obj.position.map((n: number) => Math.round(n * 100) / 100),
        rotation: obj.rotation.map((n: number) => Math.round(n * 100) / 100),
        scale:    obj.scale.map((n: number) => Math.round(n * 100) / 100),
      }));
    } catch {
      return data;
    }
  }, []);

  // Cargar datos guardados tras configurar la habitación
  useEffect(() => {
    if (!config) return;
    const saved = localStorage.getItem('sceneObjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSceneObjects(parsed);
      } catch {
        console.warn('No se pudo parsear escena guardada');
        localStorage.removeItem('sceneObjects');
      }
    }
  }, [config]);

  // Guardar escena en cada cambio
  useEffect(() => {
    if (!config) return;
    try {
      const compressed = compressData(sceneObjects);
      localStorage.setItem('sceneObjects', JSON.stringify(compressed));
      setError(null);
    } catch {
      setError('Error guardando escena');
    }
  }, [sceneObjects, compressData, config]);

  // Funciones CRUD
  const addObject = (type: string) => {
    const newObj = {
      id: Date.now(),
      type,
      position: [0, 0.5, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      color: '#3b82f6',
    };
    setSceneObjects(prev => [...prev, newObj]);
    setSelectedId(newObj.id);
  };

  const deleteSelected = () => {
    if (selectedId !== null) {
      setSceneObjects(prev => prev.filter(o => o.id !== selectedId));
      setSelectedId(null);
    }
  };

  const duplicateSelected = () => {
    if (selectedId !== null) {
      const sel = sceneObjects.find(o => o.id === selectedId);
      if (sel) {
        const dup = { ...sel, id: Date.now(), position: [sel.position[0] + 1, sel.position[1], sel.position[2] + 1] as [number, number, number] };
        setSceneObjects(prev => [...prev, dup]);
        setSelectedId(dup.id);
      }
    }
  };

  const exportScene = () => {
    try {
      const dataStr = JSON.stringify(sceneObjects, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scene.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting', err);
    }
  };

  const importScene = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.json')) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const arr = JSON.parse(ev.target?.result as string);
        if (Array.isArray(arr)) {
          setSceneObjects(arr);
          setSelectedId(null);
        }
      } catch {
        alert('JSON inválido');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddFurniture = (item: any) => {
    const newObj = {
      id: Date.now(),
      type: 'furniture',
      name: item.name,
      position: [0, item.dimensions[1] / 2, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: item.dimensions as [number, number, number],
      color: item.color || '#3b82f6',
      furnitureId: item.id,
    };
    setSceneObjects(prev => [...prev, newObj]);
    setSelectedId(newObj.id);
  };

  const handleModelImport = (data: any) => {
    const newObj = {
      id: Date.now(),
      type: 'model',
      name: data.name,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      color: '#3b82f6',
      modelUrl: data.url,
    };
    setSceneObjects(prev => [...prev, newObj]);
    setSelectedId(newObj.id);
  };

  // Render según configuración
  if (!config) {
    return <RoomSetup onComplete={cfg => setConfig(cfg)} />;
  }

  return (
    <div className="app-container">
      {error && <div className="error-banner">{error}</div>}
      <div className="scene-area">
        <Scene
          sceneObjects={sceneObjects}
          setSceneObjects={setSceneObjects}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          walls={config.walls}
          floorDims={config.floorDims}
          wallColor={config.wallColor}
          floorTexture={config.floorTexture}
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
  );
};

export default App;
