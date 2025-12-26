# 🛡️ Token Flow Simulator: The Ultimate Identity Playground

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Security](https://img.shields.io/badge/Security-Identity%20&%20Access-success)](https://oauth.net/2/)

A high-fidelity, interactive sandbox for mastering modern authentication and authorization. Whether you're debugging a JWT, simulating a SAML assertion, or learning the intricacies of PKCE, this tool provides a visual and hands-on environment to understand the "how" and "why" behind identity protocols.

---

## 🌟 Features

### 🔑 Token Mastery
- **JWT Encoder/Decoder**: Deep-dive into JSON Web Tokens. Inspect headers, payloads, and signatures with ease.
- **Token Diffing**: Compare two tokens side-by-side to identify subtle changes in claims or structure.
- **SAML Tools**: Decode and analyze SAML XML responses—no more messy XML headaches.

### 🔄 Flow & Protocol Visualization
- **OAuth2/OIDC Visualizer**: Watch the dance between Client, Authorization Server, and Resource Owner in real-time.
- **PKCE Generator**: Generate Code Verifiers and Challenges to understand the Proof Key for Code Exchange flow.
- **Scope Explorer**: Visual representation of how scopes translate to permissions.

### 🛠️ Developer Utilities
- **Key Manager**: Manage RSA/EC keys and certificates for signing and encryption.
- **Format Converter**: Seamlessly convert between PEM, JWK, and other common key formats.
- **Secret Generator**: Securely generate high-entropy client secrets and salts.

### 🎓 Educational Tools
- **Failure Simulator**: Deliberately break things to see how errors (expired tokens, invalid signatures, mismatched audiences) manifest.
- **Learn Flows**: Integrated guides to teach the mechanics of modern identity.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/token-flow-simulator.git
    cd token-flow-simulator
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Launch the simulator:**
    ```bash
    npm run dev
    ```
4.  **Open your browser:** Navigate to `http://localhost:5173`.

---

## 🏗️ Architecture

This project is built with performance and privacy in mind:
- **Client-Side Only**: All encoding, decoding, and simulations happen entirely in your browser. No sensitive data, keys, or tokens are ever sent to a server.
- **Modular Componentry**: Each security tool is a standalone React component, making the platform easy to extend.
- **Type-Safe Security**: Leverages TypeScript for robust handling of complex identity types and schemas.

---

## 🧩 Components Deep Dive

| Tool | Purpose |
| :--- | :--- |
| **`JwtEncoder/Decoder`** | Full lifecycle management of JWT tokens. |
| **`KeyManager`** | RSA/EC keypair generation and management. |
| **`FlowVisualizer`** | Interactive sequence diagrams for OAuth2 flows. |
| **`FailureSimulator`** | Sandbox for testing negative authentication scenarios. |
| **`SamlTools`** | XML-based identity assertion debugging. |
| **`PkceGenerator`** | Cryptographic utility for mobile/SPA security. |

---

## 🛡️ Privacy & Security

**Your data stays with you.** This application is a static site with no backend persistence. 
- 🔒 No telemetry.
- 🔒 No server-side logging.
- 🔒 No third-party API dependencies (except local rendering).

---

## 🤝 Contributing

Contributions are welcome! If you have a new flow or tool you'd like to see, feel free to open a PR. Let's make identity easier for everyone.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for the identity community.</sub>
</div>
