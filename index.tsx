import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary to prevent "White Screen of Death"
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh', 
          backgroundColor: '#8A1538', 
          color: 'white',
          fontFamily: 'Tajawal, sans-serif',
          textAlign: 'center',
          padding: '20px',
          direction: 'rtl'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>عذراً، حدث خطأ غير متوقع</h1>
          <p style={{ marginBottom: '20px', opacity: 0.8 }}>يرجى إعادة تحميل الصفحة</p>
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.2)', 
            padding: '15px', 
            borderRadius: '8px', 
            fontSize: '12px', 
            maxWidth: '90%', 
            overflow: 'auto',
            textAlign: 'left',
            direction: 'ltr'
          }}>
             {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', color: '#8A1538', backgroundColor: 'white', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            إعادة التحميل
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);