/**
 * Login form component that captures credentials, authenticates via the API,
 * stores the token, and redirects to the protected dashboard.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { usuarioAPI } from '../services/api';

function Login() {
  const [formData, setFormData] = useState({
    codigo_usu: '',
    clave: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await usuarioAPI.authenticate(formData);
      const { user, token } = response.data?.data || {};

      if (!user || !token) {
        throw new Error('Respuesta de autenticacion invalida');
      }

      // Store user and token in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      // Redirect to dashboard
      navigate('/');
    } catch {
      setError('Credenciales incorrectas o usuario inactivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="codigo_usu"
              label="Código de Usuario"
              name="codigo_usu"
              autoComplete="username"
              autoFocus
              value={formData.codigo_usu}
              onChange={handleChange}
              type="number"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="clave"
              label="Contraseña"
              type="password"
              id="clave"
              autoComplete="current-password"
              value={formData.clave}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#0b7a43',
                '&:hover': {
                  bgcolor: '#095f34',
                },
              }}
              disabled={loading}
            >
                            {loading ? <CircularProgress size={24} /> : 'Iniciar sesión'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
