import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider, 
  FormControl, 
  FormHelperText, 
  Grid, 
  IconButton, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  Typography 
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

/**
 * Secrets Manager component for managing API tokens and other sensitive information.
 * 
 * This component provides a UI for administrators to manage secrets securely.
 */
const SecretsManager = () => {
  // State for secrets
  const [secrets, setSecrets] = useState([]);
  const [creators, setCreators] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState(null);
  
  // Form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  // Fetch secrets on component mount and when selectedCreator changes
  useEffect(() => {
    fetchSecrets();
    fetchCreators();
  }, [selectedCreator]);
  
  /**
   * Fetch secrets from the API.
   */
  const fetchSecrets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = selectedCreator 
        ? `/api/admin/secrets?creator_id=${selectedCreator}` 
        : '/api/admin/secrets';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch secrets');
      }
      
      const data = await response.json();
      setSecrets(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetch creators from the API.
   */
  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/admin/creators', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch creators');
      }
      
      const data = await response.json();
      setCreators(data);
    } catch (error) {
      console.error('Error fetching creators:', error);
    }
  };
  
  /**
   * Handle creating a new secret.
   * 
   * @param {Object} data - The form data.
   */
  const handleCreateSecret = async (data) => {
    try {
      const response = await fetch('/api/admin/secrets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create secret');
      }
      
      // Close the dialog and refresh the secrets
      setCreateDialogOpen(false);
      reset();
      fetchSecrets();
    } catch (error) {
      setError(error.message);
    }
  };
  
  /**
   * Handle updating a secret.
   * 
   * @param {Object} data - The form data.
   */
  const handleUpdateSecret = async (data) => {
    try {
      const response = await fetch(`/api/admin/secrets/${selectedSecret.name}?creator_id=${selectedSecret.creator_id || ''}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          value: data.value,
          description: data.description
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update secret');
      }
      
      // Close the dialog and refresh the secrets
      setEditDialogOpen(false);
      setSelectedSecret(null);
      reset();
      fetchSecrets();
    } catch (error) {
      setError(error.message);
    }
  };
  
  /**
   * Handle deleting a secret.
   */
  const handleDeleteSecret = async () => {
    try {
      const response = await fetch(`/api/admin/secrets/${selectedSecret.name}?creator_id=${selectedSecret.creator_id || ''}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete secret');
      }
      
      // Close the dialog and refresh the secrets
      setDeleteDialogOpen(false);
      setSelectedSecret(null);
      fetchSecrets();
    } catch (error) {
      setError(error.message);
    }
  };
  
  /**
   * Open the edit dialog for a secret.
   * 
   * @param {Object} secret - The secret to edit.
   */
  const openEditDialog = (secret) => {
    setSelectedSecret(secret);
    reset({
      name: secret.name,
      value: '',  // For security, we don't pre-fill the value
      creator_id: secret.creator_id,
      description: secret.description
    });
    setEditDialogOpen(true);
  };
  
  /**
   * Open the delete dialog for a secret.
   * 
   * @param {Object} secret - The secret to delete.
   */
  const openDeleteDialog = (secret) => {
    setSelectedSecret(secret);
    setDeleteDialogOpen(true);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Secrets Manager
      </Typography>
      
      <Typography variant="body1" paragraph>
        Manage API tokens and other sensitive information securely. Secrets are stored in Supabase Vault and are only accessible to authorized administrators.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="creator-select-label">Creator</InputLabel>
              <Select
                labelId="creator-select-label"
                id="creator-select"
                value={selectedCreator}
                label="Creator"
                onChange={(e) => setSelectedCreator(e.target.value)}
              >
                <MenuItem value="">All Creators</MenuItem>
                {creators.map((creator) => (
                  <MenuItem key={creator.id} value={creator.id}>
                    {creator.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Filter secrets by creator</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                reset({
                  creator_id: selectedCreator,
                  name: '',
                  value: '',
                  description: ''
                });
                setCreateDialogOpen(true);
              }}
            >
              Add Secret
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Creator</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : secrets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No secrets found
                </TableCell>
              </TableRow>
            ) : (
              secrets.map((secret) => (
                <TableRow key={secret.id}>
                  <TableCell>{secret.name}</TableCell>
                  <TableCell>
                    {secret.creator_id ? 
                      creators.find(c => c.id === secret.creator_id)?.name || secret.creator_id 
                      : 'Global'}
                  </TableCell>
                  <TableCell>{secret.description || '-'}</TableCell>
                  <TableCell>
                    {secret.updated_at ? new Date(secret.updated_at).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => openEditDialog(secret)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => openDeleteDialog(secret)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Create Secret Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleCreateSecret)}>
          <DialogTitle>Add Secret</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Name"
                fullWidth
                margin="normal"
                {...register('name', { required: 'Name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              
              <TextField
                label="Value"
                fullWidth
                margin="normal"
                type="password"
                {...register('value', { required: 'Value is required' })}
                error={!!errors.value}
                helperText={errors.value?.message}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="creator-id-label">Creator</InputLabel>
                <Select
                  labelId="creator-id-label"
                  label="Creator"
                  defaultValue={selectedCreator}
                  {...register('creator_id')}
                >
                  <MenuItem value="">Global</MenuItem>
                  {creators.map((creator) => (
                    <MenuItem key={creator.id} value={creator.id}>
                      {creator.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                {...register('description')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Edit Secret Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleUpdateSecret)}>
          <DialogTitle>Edit Secret: {selectedSecret?.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Value"
                fullWidth
                margin="normal"
                type="password"
                {...register('value', { required: 'Value is required' })}
                error={!!errors.value}
                helperText={errors.value?.message}
              />
              
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                {...register('description')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Delete Secret Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Secret</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the secret "{selectedSecret?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteSecret} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecretsManager;
