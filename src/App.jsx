import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState(null); // Store the uploaded image
  const [selection, setSelection] = useState({}); // Store selection coordinates
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); // Store dimensions
  const [coordinates, setCoordinates] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 }); // Store coordinates
  const [rgbColor, setRgbColor] = useState(""); // Store RGB color of the selected area
  const canvasRef = useRef(null); // Reference to the canvas element

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle mouse events for selection
  const handleMouseDown = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;
    setSelection({ startX, startY, endX: startX, endY: startY });
    setCoordinates({ x1: startX, y1: startY, x2: startX, y2: startY });
  };

  const handleMouseMove = (event) => {
    if (selection.startX !== undefined && selection.startY !== undefined) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const endX = event.clientX - rect.left;
      const endY = event.clientY - rect.top;
      setSelection((prev) => ({ ...prev, endX, endY }));

      // Calculate width and height
      const width = Math.abs(endX - selection.startX);
      const height = Math.abs(endY - selection.startY);
      setDimensions({ width, height });

      // Update coordinates
      setCoordinates({
        x1: selection.startX,
        y1: selection.startY,
        x2: endX,
        y2: endY,
      });
    }
  };

  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Get the RGB color of the selected area
    const imageData = ctx.getImageData(
      selection.startX,
      selection.startY,
      dimensions.width,
      dimensions.height
    );
    const data = imageData.data;

    // Calculate the average RGB color
    let r = 0,
      g = 0,
      b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    const pixelCount = data.length / 4;
    const avgR = Math.round(r / pixelCount);
    const avgG = Math.round(g / pixelCount);
    const avgB = Math.round(b / pixelCount);
    setRgbColor(`RGB(${avgR}, ${avgG}, ${avgB})`);

    // Send coordinates and RGB color to the backend
    const dataToSend = {
      x1: coordinates.x1,
      y1: coordinates.y1,
      x2: coordinates.x2,
      y2: coordinates.y2,
      width: dimensions.width,
      height: dimensions.height,
      rgb: `RGB(${avgR}, ${avgG}, ${avgB})`,
    };


    setSelection({});
  };

  // Draw the image and selection area on the canvas
  const drawCanvas = () => {


    if (image) {
      const img = new Image();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      img.src = image;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Draw the selection rectangle
        if (selection.startX !== undefined && selection.endX !== undefined) {
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            selection.startX,
            selection.startY,
            selection.endX - selection.startX,
            selection.endY - selection.startY
          );
        }
      };
    }
  };

  // Render the canvas whenever the image or selection changes
  React.useEffect(() => {
    drawCanvas();
  }, [image, selection]);

  return (
    <div className="App">
      <h1>Image Area Selector</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br />
      <br />
      {image && (
        <>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ border: "1px solid black" }}
          />
          <br />
          <br />
          <div>
            <strong>Selected Area Dimensions:</strong>
            <br />
            Width: {dimensions.width}px
            <br />
            Height: {dimensions.height}px
          </div>
          <div>
            <strong>Coordinates:</strong>
            <br />
            Start: ({coordinates.x1.toFixed(1)}, {coordinates.y1.toFixed(1)})
            <br />
            End: ({coordinates.x2.toFixed(1)}, {coordinates.y2.toFixed(1)})
          </div>
          <div>
            <strong>Average RGB Color:</strong>
            <br />
            {rgbColor}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
