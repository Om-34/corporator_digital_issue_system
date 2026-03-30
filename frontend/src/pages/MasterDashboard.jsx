import React, { useEffect, useState } from 'react';
import { 
  Box, Paper, Typography, Grid, Card, CardContent, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar 
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import HistoryIcon from '@mui/icons-material/History';

const MasterDashboard = () => {
  const [officeData, setOfficeData] = useState([]);
  const [adminActivity, setAdminActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetching both Ward Stats and Admin Activity
        const [statsRes, activityRes] = await Promise.all([
          axios.get('http://localhost:5000/api/dashboard/office-stats', config),
          axios.get('http://localhost:5000/api/dashboard/admin-activity', config)
        ]);

        setOfficeData(statsRes.data);
        setAdminActivity(activityRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching master data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBarColor = (count) => {
    if (count > 20) return '#d32f2f'; // High - Red
    if (count > 10) return '#f57c00'; // Medium - Orange
    return '#388e3c'; // Low - Green
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Box p={3} sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#1a237e', mb: 4 }}>
        PCMC Global Command Center
      </Typography>

      <Grid container spacing={3}>
        {/* TOP SECTION: CHART */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Ward Performance Hotspots
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={3}>
              Real-time complaint distribution across all PCMC jurisdictions.
            </Typography>
            
            <Box sx={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={officeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="office_name" angle={-45} textAnchor="end" height={70} interval={0} tick={{fontSize: 12}} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {officeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* MIDDLE SECTION: KPI CARDS */}
        {officeData.slice(0, 3).map((office, index) => (
          <Grid item xs={12} md={4} key={office.office_name}>
            <Card elevation={0} sx={{ borderRadius: 3, borderLeft: `8px solid ${getBarColor(office.count)}`, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography color="textSecondary" variant="overline" sx={{ fontWeight: 'bold' }}>
                   {index === 0 ? "⚠️ Critical Area" : "Volume Alert"}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{office.office_name}</Typography>
                <Typography variant="h3" color="primary" sx={{ mt: 1, fontWeight: 900 }}>
                  {office.count} <span style={{ fontSize: '16px', fontWeight: 400, color: '#666' }}>Active Issues</span>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* BOTTOM SECTION: ADMIN ACTIVITY TABLE */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <HistoryIcon sx={{ mr: 1, color: '#1a237e' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Ward Administrator Activity
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Administrator</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Assigned Ward</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Login</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adminActivity.map((admin) => (
                    <TableRow key={admin.phone} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 30, height: 30, mr: 1, bgcolor: '#1a237e', fontSize: '12px' }}>
                            {admin.name.charAt(0)}
                          </Avatar>
                          {admin.name}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{admin.office_name}</TableCell>
                      <TableCell>{admin.phone}</TableCell>
                      <TableCell>
                        {admin.last_login 
                          ? new Date(admin.last_login).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) 
                          : "Never Logged In"}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={admin.is_active ? "Online" : "Inactive"} 
                          size="small"
                          color={admin.is_active ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MasterDashboard;