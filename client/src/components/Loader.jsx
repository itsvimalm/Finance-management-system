import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = true }) => {
    const containerStyle = fullScreen
        ? {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            backgroundColor: 'var(--background)'
        }
        : {
            display: 'flex',
            justifyContent: 'center',
            padding: '2rem'
        };

    return (
        <div style={containerStyle}>
            <Loader2 className="spinner" size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Loader;
