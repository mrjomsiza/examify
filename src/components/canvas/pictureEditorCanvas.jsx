import { Tldraw, createShapeId } from 'tldraw'
import 'tldraw/tldraw.css'
import { useRef } from 'react'

export const MarkingCanvas = ({ imageUrl, onSave }) => {
  const editorRef = useRef(null)
  
  // This function triggers when the student is done marking
  const handleExport = async () => {
    if (!editorRef.current) return
    // 1. Get the image as a blob
    const { blob } = await editorRef.current.exportToBlob({
      format: 'png',
      quality: 1,
      scale: 2, // Higher quality for grading
    })
    
    // 2. Pass it back to your save function
    const file = new File([blob], "graded-work.png", { type: "image/png" });
    onSave(file);
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw 
        autoFocus
        onMount={(editor) => {
          editorRef.current = editor
          // 1. Load the student's work as the background
          editor.createShapes([
            {
              id: createShapeId(),
              type: 'image',
              x: 0,
              y: 0,
              props: {
                w: 800, // Adjust based on your UI
                h: 1000,
                assetId: null,
                src: imageUrl,
              },
              isLocked: true, // Lock it so they don't move the original work
            },
          ]);
        }}
      >
        {/* Custom Save Button overlaid on the canvas */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          <button 
            className="btn btn-primary"
            onClick={handleExport} 
          >
            Submit Grade
          </button>
        </div>
      </Tldraw>
    </div>
  )
}