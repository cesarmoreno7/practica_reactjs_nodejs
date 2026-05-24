/**
 * Lista y filtra tipos de usuario, permitiendo crear, editar o eliminar entradas.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { tipoUsuarioAPI } from '../services/api';

function TipoUsuarioList() {
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [filteredTipos, setFilteredTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, tipo: null });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTiposUsuario();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = tiposUsuario.filter(tipo =>
        tipo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTipos(filtered);
    } else {
      setFilteredTipos(tiposUsuario);
    }
  }, [tiposUsuario, searchTerm]);

  const fetchTiposUsuario = async () => {
    try {
      setLoading(true);
      const response = await tipoUsuarioAPI.getAll();
      setTiposUsuario(response.data);
      setError('');
    } catch (error) {
      setError('Error al cargar los tipos de usuario');
      console.error('Error fetching tipos usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await tipoUsuarioAPI.delete(deleteDialog.tipo.cod_tipo_usu);
      setDeleteDialog({ open: false, tipo: null });
      fetchTiposUsuario();
    } catch (error) {
      setError('Error al eliminar el tipo de usuario');
      console.error('Error deleting tipo usuario:', error);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await tipoUsuarioAPI.search(searchTerm);
        setFilteredTipos(response.data);
      } catch (error) {
        console.error('Error searching tipos usuario:', error);
      }
    } else {
      setFilteredTipos(tiposUsuario);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tipos de Usuario</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tipos-usuario/nuevo')}
        >
          Nuevo Tipo
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTipos.map((tipo) => (
              <TableRow key={tipo.cod_tipo_usu}>
                <TableCell>{tipo.cod_tipo_usu}</TableCell>
                <TableCell>{tipo.descripcion}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/tipos-usuario/${tipo.cod_tipo_usu}/editar`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, tipo })}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, tipo: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar el tipo de usuario "{deleteDialog.tipo?.descripcion}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, tipo: null })}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TipoUsuarioList;
