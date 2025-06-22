const App = () => {
    const [initialData, setInitialData] = React.useState(null);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        try {
            const hash = window.location.hash.substring(1);
            if (!hash) {
                setError(new Error("No file data found in the URL."));
                return;
            }
            const decodedData = atob(hash);
            const jsonData = JSON.parse(decodedData);
            
            const sceneData = {
                elements: jsonData.elements,
                appState: { ...jsonData.appState, viewBackgroundColor: "#ffffff" },
                files: jsonData.files,
            };

            setInitialData(sceneData);
        } catch (e) {
            console.error("Error parsing file data:", e);
            setError(new Error("The provided file data is corrupted or invalid."));
        }
    }, []);

    if (error) {
        return React.createElement('div', { style: { padding: '20px', color: 'red' } }, `Error: ${error.message}`);
    }

    if (!initialData) {
        return React.createElement('div', { style: { padding: '20px' } }, 'Loading preview...');
    }

    return React.createElement(
        React.Fragment,
        null,
        React.createElement(ExcalidrawLib.Excalidraw, {
            initialData: initialData,
            viewModeEnabled: true,
        })
    );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(App)); 