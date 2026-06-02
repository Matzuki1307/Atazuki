import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            background: "#020d2c",
            color: "#8fa4ff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "'Courier New', monospace",
            gap: "16px",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "18px", textTransform: "uppercase", letterSpacing: "2px" }}>
            Algo salio mal
          </div>
          <div style={{ fontSize: "12px", color: "#dbe2ff", maxWidth: "300px", textAlign: "center" }}>
            {this.state.error?.message || "Error desconocido"}
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              border: "2px solid #2a3d8a",
              background: "#d7deff",
              color: "#1c2a63",
              fontFamily: "'Courier New', monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              padding: "8px 16px",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Reiniciar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
