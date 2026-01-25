import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    textAlign: 'center',
                    background: 'var(--bg-dark)',
                    color: 'var(--text-primary)'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        background: 'var(--bg-card)',
                        padding: '40px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <h1 style={{
                            fontSize: '48px',
                            marginBottom: '16px',
                            color: 'var(--accent-error)'
                        }}>
                            ⚠️
                        </h1>
                        <h2 style={{
                            fontSize: '24px',
                            marginBottom: '16px',
                            fontFamily: 'Orbitron, sans-serif'
                        }}>
                            Something went wrong
                        </h2>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '24px',
                            lineHeight: '1.6'
                        }}>
                            We're sorry for the inconvenience. The application encountered an unexpected error.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                marginBottom: '24px',
                                textAlign: 'left',
                                background: 'rgba(0,0,0,0.2)',
                                padding: '16px',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}>
                                <summary style={{ cursor: 'pointer', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Error Details (Development Only)
                                </summary>
                                <pre style={{
                                    overflow: 'auto',
                                    fontSize: '12px',
                                    color: 'var(--accent-error)'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '12px 24px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'var(--primary-hover)'}
                            onMouseOut={(e) => e.target.style.background = 'var(--primary)'}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
