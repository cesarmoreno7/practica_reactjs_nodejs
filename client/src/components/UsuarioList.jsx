/**
 * Tabla interactiva que lista usuarios con filtros, paginación y acciones CRUD.
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { usuarioAPI, tipoUsuarioAPI } from '../services/api';

function UsuarioList() {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, usuario: null });
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsuarios();
  }, [usuarios, searchTerm, estadoFilter, tipoFilter]);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const [usuariosRes, tiposRes] = await Promise.all([
        usuarioAPI.getAll({ page, limit: 10 }),
        tipoUsuarioAPI.getAll({ page: 1, limit: 100 }), // Get all tipos for filter
      ]);
      setUsuarios(usuariosRes.data.data || usuariosRes.data);
      setPagination(usuariosRes.data.pagination);
      setTiposUsuario(tiposRes.data.data || tiposRes.data);
      setError('');
    } catch (error) {
      setError('Error al cargar los usuarios');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsuarios = () => {
    let filtered = usuarios;

    if (searchTerm) {
      filtered = filtered.filter(usuario =>
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (estadoFilter !== '') {
      filtered = filtered.filter(usuario => usuario.estado === parseInt(estadoFilter));
    }

    if (tipoFilter) {
      filtered = filtered.filter(usuario => usuario.cod_tipo_usu === parseInt(tipoFilter));
    }

    setFilteredUsuarios(filtered);
  };

  const handleDelete = async () => {
    try {
      await usuarioAPI.delete(deleteDialog.usuario.codigo_usu);
      setDeleteDialog({ open: false, usuario: null });
      fetchData();
    } catch (error) {
      setError('Error al eliminar el usuario');
      console.error('Error deleting usuario:', error);
    }
  };

  const getTipoUsuarioNombre = (codTipoUsu) => {
    const tipo = tiposUsuario.find(t => t.cod_tipo_usu === codTipoUsu);
    return tipo ? tipo.descripcion : 'N/A';
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    fetchData(page);
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
        <Typography variant="h4">Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/usuarios/nuevo')}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} mb={2}>
        <TextField
          variant="outlined"
          placeholder="Buscar por nombre o apellido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={estadoFilter}
            label="Estado"
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={1}>Activo</MenuItem>
            <MenuItem value={0}>Inactivo</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Tipo Usuario</InputLabel>
          <Select
            value={tipoFilter}
            label="Tipo Usuario"
            onChange={(e) => setTipoFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {tiposUsuario.map((tipo) => (
              <MenuItem key={tipo.cod_tipo_usu} value={tipo.cod_tipo_usu}>
                {tipo.descripcion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Tipo Usuario</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsuarios.map((usuario) => (
              <TableRow key={usuario.codigo_usu}>
                <TableCell>{usuario.codigo_usu}</TableCell>
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>{usuario.apellido}</TableCell>
                <TableCell>{getTipoUsuarioNombre(usuario.cod_tipo_usu)}</TableCell>
                <TableCell>
                  <Chip
                    label={usuario.estado === 1 ? 'Activo' : 'Inactivo'}
                    color={usuario.estado === 1 ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/usuarios/${usuario.codigo_usu}/editar`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, usuario })}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3} mb={2}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, usuario: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar al usuario "{deleteDialog.usuario?.nombre} {deleteDialog.usuario?.apellido}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, usuario: null })}>
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

export default UsuarioList;
