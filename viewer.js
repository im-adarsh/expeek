import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const rawUrl = new URLSearchParams(window.location.search).get("rawUrl");
    if (!rawUrl) {
      showError("No file URL provided.");
      return;
    }

    document.title = decodeURIComponent(rawUrl).split("/").pop();

    fetch(rawUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((json) => {
        document.getElementById("loading").style.display = "none";
        setData(json);
      })
      .catch((err) => {
        showError(`Failed to load file: ${err.message}`);
      });
  }, []);

  if (!data) return null;

  return (
    <Excalidraw
      initialData={{
        elements: data.elements || [],
        appState: {
          ...(data.appState || {}),
          viewModeEnabled: true,
          viewBackgroundColor: "#ffffff",
          gridSize: null,
        },
        files: data.files || null,
      }}
      viewModeEnabled={true}
      zenModeEnabled={true}
    />
  );
}

function showError(msg) {
  document.getElementById("loading").style.display = "none";
  const el = document.getElementById("error");
  el.style.display = "flex";
  el.textContent = msg;
}

createRoot(document.getElementById("root")).render(<App />);
