import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Circle, Line, IText, FabricImage, type FabricObject } from 'fabric';
import type { LabelTemplateType } from '@netmd-studio/types';
import { getTemplateConfig, mmToPxDisplay, BLEED_MM, GRID_SPACING_MM, MAX_UNDO_STATES } from '../constants';

export interface EditorState {
  canvas: Canvas | null;
  templateType: LabelTemplateType;
  showGrid: boolean;
  showBleed: boolean;
  selectedObject: FabricObject | null;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
}

export function useLabelEditor(canvasElRef: React.RefObject<HTMLCanvasElement | null>) {
  const canvasRef = useRef<Canvas | null>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUndoRedo = useRef(false);

  const [state, setState] = useState<EditorState>({
    canvas: null,
    templateType: 'jcard_front',
    showGrid: false,
    showBleed: false,
    selectedObject: null,
    canUndo: false,
    canRedo: false,
    zoom: 1,
  });

  const saveState = useCallback(() => {
    if (isUndoRedo.current || !canvasRef.current) return;
    const json = JSON.stringify(canvasRef.current.toJSON());
    undoStack.current.push(json);
    if (undoStack.current.length > MAX_UNDO_STATES) {
      undoStack.current.shift();
    }
    redoStack.current = [];
    setState((s) => ({
      ...s,
      canUndo: undoStack.current.length > 1,
      canRedo: false,
    }));
  }, []);

  const initCanvas = useCallback(
    (templateType: LabelTemplateType) => {
      if (!canvasElRef.current) return;

      // Dispose previous canvas
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }

      const config = getTemplateConfig(templateType);
      const width = mmToPxDisplay(config.widthMm);
      const height = mmToPxDisplay(config.heightMm);

      const canvas = new Canvas(canvasElRef.current, {
        width,
        height,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
        selection: true,
      });

      // Disc label: add circular clipping
      if (config.isCircle) {
        const clipPath = new Circle({
          radius: width / 2,
          originX: 'center',
          originY: 'center',
          left: width / 2,
          top: height / 2,
        });
        canvas.clipPath = clipPath;
      }

      canvas.on('object:modified', saveState);
      canvas.on('object:added', saveState);
      canvas.on('object:removed', saveState);
      canvas.on('selection:created', (e) => {
        setState((s) => ({ ...s, selectedObject: e.selected?.[0] ?? null }));
      });
      canvas.on('selection:updated', (e) => {
        setState((s) => ({ ...s, selectedObject: e.selected?.[0] ?? null }));
      });
      canvas.on('selection:cleared', () => {
        setState((s) => ({ ...s, selectedObject: null }));
      });

      canvasRef.current = canvas;
      undoStack.current = [JSON.stringify(canvas.toJSON())];
      redoStack.current = [];

      setState((s) => ({
        ...s,
        canvas,
        templateType,
        selectedObject: null,
        canUndo: false,
        canRedo: false,
      }));
    },
    [canvasElRef, saveState]
  );

  const undo = useCallback(() => {
    if (undoStack.current.length <= 1 || !canvasRef.current) return;
    isUndoRedo.current = true;
    const currentState = undoStack.current.pop()!;
    redoStack.current.push(currentState);
    const prevState = undoStack.current[undoStack.current.length - 1];
    canvasRef.current.loadFromJSON(prevState).then(() => {
      canvasRef.current!.renderAll();
      isUndoRedo.current = false;
      setState((s) => ({
        ...s,
        canUndo: undoStack.current.length > 1,
        canRedo: redoStack.current.length > 0,
        selectedObject: null,
      }));
    });
  }, []);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0 || !canvasRef.current) return;
    isUndoRedo.current = true;
    const nextState = redoStack.current.pop()!;
    undoStack.current.push(nextState);
    canvasRef.current.loadFromJSON(nextState).then(() => {
      canvasRef.current!.renderAll();
      isUndoRedo.current = false;
      setState((s) => ({
        ...s,
        canUndo: undoStack.current.length > 1,
        canRedo: redoStack.current.length > 0,
        selectedObject: null,
      }));
    });
  }, []);

  const addText = useCallback(
    (text = 'New Text', options?: Partial<{ fontSize: number; fontFamily: string; fill: string; fontWeight: string }>) => {
      if (!canvasRef.current) return;
      const config = getTemplateConfig(state.templateType);
      const canvasWidth = mmToPxDisplay(config.widthMm);
      const canvasHeight = mmToPxDisplay(config.heightMm);
      const textObj = new IText(text, {
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        fontSize: options?.fontSize ?? 16,
        fontFamily: options?.fontFamily ?? 'Inter',
        fill: options?.fill ?? '#000000',
        fontWeight: options?.fontWeight ?? 'normal',
        editable: true,
      });
      canvasRef.current.add(textObj);
      canvasRef.current.setActiveObject(textObj);
      canvasRef.current.renderAll();
    },
    [state.templateType]
  );

  const addShape = useCallback(
    (shape: 'rect' | 'circle' | 'line', options?: Partial<{ fill: string; stroke: string; strokeWidth: number }>) => {
      if (!canvasRef.current) return;
      const config = getTemplateConfig(state.templateType);
      const canvasWidth = mmToPxDisplay(config.widthMm);
      const canvasHeight = mmToPxDisplay(config.heightMm);
      let obj: FabricObject;

      if (shape === 'rect') {
        obj = new Rect({
          left: canvasWidth / 2 - 40,
          top: canvasHeight / 2 - 30,
          width: 80,
          height: 60,
          fill: options?.fill ?? 'transparent',
          stroke: options?.stroke ?? '#000000',
          strokeWidth: options?.strokeWidth ?? 1,
        });
      } else if (shape === 'circle') {
        obj = new Circle({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          radius: 30,
          originX: 'center',
          originY: 'center',
          fill: options?.fill ?? 'transparent',
          stroke: options?.stroke ?? '#000000',
          strokeWidth: options?.strokeWidth ?? 1,
        });
      } else {
        obj = new Line([canvasWidth / 4, canvasHeight / 2, (canvasWidth * 3) / 4, canvasHeight / 2], {
          stroke: options?.stroke ?? '#000000',
          strokeWidth: options?.strokeWidth ?? 2,
        });
      }

      canvasRef.current.add(obj);
      canvasRef.current.setActiveObject(obj);
      canvasRef.current.renderAll();
    },
    [state.templateType]
  );

  const addImage = useCallback(async (url: string) => {
    if (!canvasRef.current) return;
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      const canvas = canvasRef.current;
      const canvasW = canvas.getWidth();
      const canvasH = canvas.getHeight();

      // Scale image to fit canvas
      const scale = Math.min(canvasW / (img.width ?? 1), canvasH / (img.height ?? 1), 1);
      img.set({
        left: canvasW / 2,
        top: canvasH / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    } catch (err) {
      console.error('Failed to load image:', err);
    }
  }, []);

  const setBackgroundImage = useCallback(async (url: string) => {
    if (!canvasRef.current) return;
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      const canvas = canvasRef.current;
      const canvasW = canvas.getWidth();
      const canvasH = canvas.getHeight();

      const scale = Math.max(canvasW / (img.width ?? 1), canvasH / (img.height ?? 1));
      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: 'left',
        originY: 'top',
      });

      canvas.backgroundImage = img;
      canvas.renderAll();
      saveState();
    } catch (err) {
      console.error('Failed to set background image:', err);
    }
  }, [saveState]);

  const setBackgroundColor = useCallback((color: string) => {
    if (!canvasRef.current) return;
    canvasRef.current.backgroundColor = color;
    canvasRef.current.backgroundImage = undefined;
    canvasRef.current.renderAll();
    saveState();
  }, [saveState]);

  const deleteSelected = useCallback(() => {
    if (!canvasRef.current) return;
    const active = canvasRef.current.getActiveObjects();
    active.forEach((obj) => canvasRef.current!.remove(obj));
    canvasRef.current.discardActiveObject();
    canvasRef.current.renderAll();
  }, []);

  const moveLayer = useCallback((direction: 'up' | 'down' | 'top' | 'bottom') => {
    if (!canvasRef.current) return;
    const obj = canvasRef.current.getActiveObject();
    if (!obj) return;
    switch (direction) {
      case 'up':
        canvasRef.current.bringObjectForward(obj);
        break;
      case 'down':
        canvasRef.current.sendObjectBackwards(obj);
        break;
      case 'top':
        canvasRef.current.bringObjectToFront(obj);
        break;
      case 'bottom':
        canvasRef.current.sendObjectToBack(obj);
        break;
    }
    canvasRef.current.renderAll();
    saveState();
  }, [saveState]);

  const toggleGrid = useCallback(() => {
    setState((s) => ({ ...s, showGrid: !s.showGrid }));
  }, []);

  const toggleBleed = useCallback(() => {
    setState((s) => ({ ...s, showBleed: !s.showBleed }));
  }, []);

  const getCanvasJSON = useCallback(() => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toJSON();
  }, []);

  const loadCanvasJSON = useCallback(async (json: Record<string, unknown>) => {
    if (!canvasRef.current) return;
    isUndoRedo.current = true;
    await canvasRef.current.loadFromJSON(json);
    canvasRef.current.renderAll();
    isUndoRedo.current = false;
    saveState();
  }, [saveState]);

  const exportDataURL = useCallback(
    (multiplier: number) => {
      if (!canvasRef.current) return null;
      // multiplier = 300/72 ≈ 4.167 for 300 DPI export
      return canvasRef.current.toDataURL({
        format: 'png',
        multiplier,
        quality: 1,
      });
    },
    []
  );

  const getObjects = useCallback(() => {
    if (!canvasRef.current) return [];
    return canvasRef.current.getObjects();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (mod && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only delete if not editing text
        const activeObj = canvasRef.current?.getActiveObject();
        if (activeObj && (activeObj as IText).isEditing) return;
        if (activeObj) {
          e.preventDefault();
          deleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelected]);

  return {
    ...state,
    initCanvas,
    addText,
    addShape,
    addImage,
    setBackgroundImage,
    setBackgroundColor,
    deleteSelected,
    moveLayer,
    toggleGrid,
    toggleBleed,
    undo,
    redo,
    getCanvasJSON,
    loadCanvasJSON,
    exportDataURL,
    getObjects,
    saveState,
  };
}
