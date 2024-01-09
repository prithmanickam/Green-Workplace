import React, { useState, useEffect } from "react";
import SideNavbar from '../components/SideNavbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Card, CardContent, Grid, Select, MenuItem, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";
import { toast } from "react-toastify";
import useAuth from '../hooks/useAuth';

export default function CompanyAdminFunctions() {
  const { userData } = useUser();
  const [amberStandard, setAmberStandard] = useState('');
  const [redStandard, setRedStandard] = useState('');
  const [registeredAccounts, setRegisteredAccounts] = useState([]);
  const [offices, setOffices] = useState([]);
  const [newOffice, setNewOffice] = useState('');
  const [selectedDeleteOffice, setSelectedDeleteOffice] = useState('');
  const [selectedUpdateOffice, setSelectedUpdateOffice] = useState('');
  const [selectedUpdateEmployee, setSelectedUpdateEmployee] = useState('');
  const [selectedDeleteEmployee, setSelectedDeleteEmployee] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDialogOpen = () => {
    setOpenDeleteDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = () => {
    handleDeleteEmployee(); 
    setOpenDeleteDialog(false);
  };

  useAuth(["Admin"]);

  useEffect(() => {
    if (userData) {
      // to get all offices in the company
      fetch(`${baseURL}/getOffices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: userData.company_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setOffices(data.data);
          } else {
            toast.error("Failed to fetch office data. Please try again.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching teams data.");
        });


      // Get all users (not admins) - for selecting team members
      fetch(`${baseURL}/getAllUsers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: userData.company_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            const allEmails = data.users.map((user) => user.email);
            setRegisteredAccounts(allEmails);
          } else {
            toast.error("Failed to fetch user data. Please try again.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching user data.");
        });

    }
  }, [userData]);

  const handleSaveStandards = () => {
    if (userData) {
      // Send the standards to the server
      fetch(`${baseURL}/editCompanyCarbonStandard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: userData.company_id,
          greenStandard: 0,
          amberStandard,
          redStandard,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {

            toast.success('Standards saved successfully');
          } else {

            toast.error('Failed to save standards');
          }
        })
        .catch((error) => {

          toast.error('An error occurred while saving standards', error);
        });
    }
  };

  const handleAddOffice = () => {

    fetch(`${baseURL}/addOffice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        officeName: newOffice,
        company_id: userData.company_id
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          toast.success('Office added successfully');
          setNewOffice('');
        } else {
          toast.error('Failed to add office');
        }
      })
      .catch(error => {
        toast.error('An error occurred while adding office');
      });
  };

  const handleDeleteOffice = () => {
    if (!selectedDeleteOffice) {
      toast.error('Please select an office to delete');
      return;
    }

    fetch(`${baseURL}/deleteOffice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_id: userData.company_id,
        officeId: selectedDeleteOffice
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          toast.success('Office deleted successfully');
          setOffices(offices.filter(office => office.id !== selectedDeleteOffice)); 
          setSelectedDeleteOffice('');
        } else {
          toast.error('Failed to delete office');
        }
      })
      .catch(error => {
        toast.error('An error occurred while deleting office');
      });
  };

  const handleUpdateEmployeeOffice = () => {
    if (!selectedUpdateEmployee || !selectedUpdateOffice) {
      toast.error('Please select an employee and an office');
      return;
    }

    fetch(`${baseURL}/updateEmployeeOffice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeEmail: selectedUpdateEmployee,
        office_id: selectedUpdateOffice
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          toast.success('Employee office updated successfully');

        } else {
          toast.error('Failed to update employee office');
        }
      })
      .catch(error => {
        toast.error('An error occurred while updating employee office');
      });
  };

  const handleDeleteEmployee = () => {
    if (!selectedDeleteEmployee) {
      toast.error('Please select an office to delete');
      return;
    }

    fetch(`${baseURL}/deleteEmployee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeEmail: selectedDeleteEmployee,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          toast.success('Deleted Employee');
        } else {
          toast.error('Failed to delete employee');
        }
      })
      .catch(error => {
        toast.error('An error occurred while deleting office');
      });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <h1>Company Admin Functions</h1>
        <Card>
          <CardContent>
            <h3>Edit Company Carbon Standard</h3>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Green Standard"
                  variant="outlined"
                  fullWidth
                  value={0}
                  disabled
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                {/* Amber Standard */}
                <TextField
                  label="Amber Standard"
                  variant="outlined"
                  fullWidth
                  value={amberStandard}
                  onChange={(e) => setAmberStandard(e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                {/* Red Standard */}
                <TextField
                  label="Red Standard"
                  variant="outlined"
                  fullWidth
                  value={redStandard}
                  onChange={(e) => setRedStandard(e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveStandards}
            >
              Save
            </Button>

          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3>Add an Office</h3>
            <TextField
              label="Office Name"
              variant="outlined"
              fullWidth
              value={newOffice}
              onChange={(e) => setNewOffice(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddOffice}
            >
              Add
            </Button>
          </CardContent>
        </Card>

        {/* Card for Deleting an Office */}
        <Card>
          <CardContent>
            <h3>Delete an Office</h3>
            <FormControl fullWidth margin="normal">
              <InputLabel>Office</InputLabel>
              <Select
                value={selectedDeleteOffice}
                label="Office"
                onChange={(e) => setSelectedDeleteOffice(e.target.value)}
              >
                {offices.map((office, index) => (
                  <MenuItem key={index} value={office.id}>
                    {office.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDeleteOffice}
            >
              Delete
            </Button>
          </CardContent>
        </Card>

        {/* Card for Updating Employee's Office */}
        <Card>
          <CardContent>
            <h3>Update Employee Office</h3>
            <FormControl fullWidth margin="normal">
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedUpdateEmployee}
                label="Employee"
                onChange={(e) => setSelectedUpdateEmployee(e.target.value)}
              >
                {registeredAccounts.map((email, index) => (
                  <MenuItem key={index} value={email}>
                    {email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Office</InputLabel>
              <Select
                value={selectedUpdateOffice}
                label="Office"
                onChange={(e) => setSelectedUpdateOffice(e.target.value)}
              >
                {offices.map((office, index) => (
                  <MenuItem key={index} value={office.id}>
                    {office.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateEmployeeOffice}
            >
              Update
            </Button>
          </CardContent>
        </Card>

        {/* Card for Employee's Office */}
        <Card>
          <CardContent>
            <h3>Delete Employee</h3>
            <FormControl fullWidth margin="normal">
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedDeleteEmployee}
                label="Employee"
                onChange={(e) => setSelectedDeleteEmployee(e.target.value)}
              >
                {registeredAccounts.map((email, index) => (
                  <MenuItem key={index} value={email}>
                    {email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="secondary"
              onClick={handleDialogOpen}
            >
              Delete
            </Button>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this employee?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleConfirmDelete} autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
