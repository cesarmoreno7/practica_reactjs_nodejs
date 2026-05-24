/**
 * Form used for creating or editing a usuario; handles fetching related tipos,
 * syncing form state, and submitting payloads to the API.
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { usuarioAPI, tipoUsuarioAPI } from '../services/api';

function UsuarioForm() {
  const [formData, setFormData] = useState({
    cod_tipo_usu: '',
    clave: '',
    nombre: '',
    apellido: '',
    estado: true,
  });
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  useEffect(() => {
    fetchTiposUsuario();
    if (isEditing) {
      fetchUsuario();
    }
  }, [id, isEditing]);

  const fetchTiposUsuario = async () => {
    try {
      const response = await tipoUsuarioAPI.getAll();
      setTiposUsuario(response.data);
    } catch (error) {
      console.error('Error fetching tipos usuario:', error);
    }
  };

  const fetchUsuario = async () => {
    try {
      setLoading(true);
      const response = await usuarioAPI.getById(id);
      const usuario = response.data;
      setFormData({
        cod_tipo_usu: usuario.cod_tipo_usu,
        clave: '', // Don't populate password for security
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        estado: usuario.estado === 1,
      });
    } catch (error) {
      setError('Error al cargar el usuario');
      console.error('Error fetching usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        cod_tipo_usu: parseInt(formData.cod_tipo_usu),
        estado: formData.estado ? 1 : 0,
      };

      // Remove password if empty (for editing)
      if (!submitData.clave && isEditing) {
        delete submitData.clave;
      }

      if (isEditing) {
        await usuarioAPI.update(id, submitData);
        setSuccess('Usuario actualizado exitosamente');
      } else {
        await usuarioAPI.create(submitData);
        setSuccess('Usuario creado exitosamente');
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/usuarios');
      }, 1500);
    } catch (error) {
      setError('Error al guardar el usuario');
      console.error('Error saving usuario:', error);
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
          onClick={() => navigate('/usuarios')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
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
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Tipo de Usuario</InputLabel>
            <Select
              name="cod_tipo_usu"
              value={formData.cod_tipo_usu}
              label="Tipo de Usuario"
              onChange={handleChange}
            >
              {tiposUsuario.map((tipo) => (
                <MenuItem key={tipo.cod_tipo_usu} value={tipo.cod_tipo_usu}>
                  {tipo.descripcion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            margin="normal"
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
            margin="normal"
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Contraseña"
            name="clave"
            type="password"
            value={formData.clave}
            onChange={handleChange}
            required={!isEditing}
            margin="normal"
            variant="outlined"
            helperText={isEditing ? "Dejar vacío para mantener la contraseña actual" : ""}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.estado}
                onChange={handleChange}
                name="estado"
                color="primary"
              />
            }
            label="Usuario activo"
            sx={{ mt: 2 }}
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

export default UsuarioForm;
