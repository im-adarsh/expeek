window.addEventListener('message', event => {
  const { data } = event;
  if (data.type === 'renderExcalidraw') {
    const root = document.getElementById('root');
    const excalidraw = React.createElement(ExcalidrawLib.Excalidraw, {
      initialData: data.fileContent,
      viewModeEnabled: true
    });
    ReactDOM.render(excalidraw, root);
  }
});
