import React from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("EnergyIQ UI Error Boundary Caught Exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full p-8 bg-white border border-red-200 rounded-3xl shadow-lg flex flex-col items-center justify-center text-center space-y-5 animate-fade-in my-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Something went wrong while rendering this section
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              EnergyIQ encountered an unexpected client-side display issue. You can try recovering this view or reloading the workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" /> Reload Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
