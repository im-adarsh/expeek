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
        const loading = document.getElementById("loading");
        loading.classList.add("fade-out");
        setTimeout(() => { loading.style.display = "none"; }, 350);
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
  document.getElementById("error").style.display = "flex";
  document.getElementById("error-msg").textContent = msg;
}

createRoot(document.getElementById("root")).render(<App />);
