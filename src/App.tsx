const App = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0f06",
        color: "#a8b878",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#c4d4a0",
            fontFamily: '"Cinzel Decorative", Georgia, serif',
          }}
        >
          Necronomics
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: "#6b7c3e",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          &quot;That is not dead which can eternal lie...&quot;
        </p>
      </div>
    </div>
  );
};

export default App;
