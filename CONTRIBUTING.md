# Contributing to EnergyIQ

Thank you for your interest in contributing to **EnergyIQ — Commercial Campus Energy Intelligence & Predictive Maintenance Platform**!

## How to Contribute

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/EnergyIQ.git
   cd EnergyIQ
   ```
3. **Set up virtual environment**:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```
4. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```
5. **Run tests before making changes**:
   ```bash
   python -m pytest tests/ -v
   cd frontend && npm run build && cd ..
   ```
6. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
7. **Commit & push your changes**:
   ```bash
   git commit -m "feat: Add your feature description"
   git push origin feature/your-feature-name
   ```
8. **Submit a Pull Request** against the `main` branch.

## Academic & Experimental Disclaimer
EnergyIQ is an experimental production-style prototype evaluated on synthetic/simulated telemetry data. Please ensure all experimental benchmark results and model documentation reflect synthetic data context accurately.
