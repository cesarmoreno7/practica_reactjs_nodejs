/**
 * Form para crear o editar tipos de usuario con validación mínima.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { tipoUsuarioAPI } from '../services/api';

function TipoUsuarioForm() {
  const [formData, setFormData] = useState({
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      fetchTipoUsuario();
    }
  }, [id, isEditing]);

  const fetchTipoUsuario = async () => {
    try {
      setLoading(true);
      const response = await tipoUsuarioAPI.getById(id);
      setFormData({
        descripcion: response.data.descripcion,
      });
    } catch (error) {
      setError('Error al cargar el tipo de usuario');
      console.error('Error fetching tipo usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await tipoUsuarioAPI.update(id, formData);
        setSuccess('Tipo de usuario actualizado exitosamente');
      } else {
        await tipoUsuarioAPI.create(formData);
        setSuccess('Tipo de usuario creado exitosamente');
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/tipos-usuario');
      }, 1500);
    } catch (error) {
      setError('Error al guardar el tipo de usuario');
      console.error('Error saving tipo usuario:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tipos-usuario')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Editar Tipo de Usuario' : 'Nuevo Tipo de Usuario'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            margin="normal"
            variant="outlined"
          />

          <Box mt={3}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={saving}
              size="large"
            >
              {saving ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default TipoUsuarioForm;
