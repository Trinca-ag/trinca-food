import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Routes from './routes';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes />
    </BrowserRouter>
  );
}

export default App;