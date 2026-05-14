export const Header = ({ title }: { title: string }) => {
    return <div style={{ width: '100%', backgroundColor: '#c5b358' }}>
        <h1 style={{ color: '#0c0a09', flex: 1, textAlign: 'center', fontFamily: 'Eskapade' }}>{title}</h1>
    </div>
}