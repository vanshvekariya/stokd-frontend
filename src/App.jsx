import { ToastContainer } from 'react-toastify';
import Router from './routes/sections';
import { AuthProvider } from './context/AuthContext';
import { MotionLazy } from './components/MotionLazy';

function App() {
  return (
    <>
      <ToastContainer />
      <MotionLazy>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </MotionLazy>
    </>
  );
}

export default App;
