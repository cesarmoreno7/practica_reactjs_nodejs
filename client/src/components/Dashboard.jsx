/**
 * Dashboard shows aggregate stats for usuarios and tipos de usuario.
 * Fetches data via the shared API service and handles loading state.
 */
import { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { People, Category } from '@mui/icons-material';
import { usuarioAPI, tipoUsuarioAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalTiposUsuario: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usuariosRes, tiposRes] = await Promise.all([
          usuarioAPI.getAll(),
          tipoUsuarioAPI.getAll(),
        ]);

        setStats({
          totalUsuarios: usuariosRes.data.length,
          totalTiposUsuario: tiposRes.data.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Usuarios
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalUsuarios}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Category color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tipos de Usuario
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalTiposUsuario}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
