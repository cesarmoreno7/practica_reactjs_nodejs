/**
 * Root React component that wires Material UI theme, routing, and protected layouts.
 */
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UsuarioList from './components/UsuarioList';
import UsuarioForm from './components/UsuarioForm';
import TipoUsuarioList from './components/TipoUsuarioList';
import TipoUsuarioForm from './components/TipoUsuarioForm';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<UsuarioList />} />
          <Route path="usuarios/nuevo" element={<UsuarioForm />} />
          <Route path="usuarios/:id/editar" element={<UsuarioForm />} />
          <Route path="tipos-usuario" element={<TipoUsuarioList />} />
          <Route path="tipos-usuario/nuevo" element={<TipoUsuarioForm />} />
          <Route path="tipos-usuario/:id/editar" element={<TipoUsuarioForm />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
