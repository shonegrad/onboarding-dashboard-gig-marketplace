import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import { Applicant } from '../../types';
import { StatusChip } from '../../components/common/StatusChip';

interface ApplicantsGridProps {
    applicants: Applicant[];
    onApplicantSelect: (applicant: Applicant) => void;
    loading?: boolean;
}

const columns: GridColDef[] = [
    {
        field: 'name',
        headerName: 'Name',
        flex: 1.5,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams<Applicant>) => (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" fontWeight="600" color="text.primary">
                    {params.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {params.row.email}
                </Typography>
            </Box>
        ),
    },
    {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 140,
        renderCell: (params: GridRenderCellParams<Applicant>) => (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <StatusChip status={params.value} />
            </Box>
        ),
    },
    {
        field: 'location',
        headerName: 'Location',
        flex: 1,
        valueGetter: (_value, row: Applicant) => `${row.location.city}, ${row.location.region}`,
    },
    {
        field: 'lastStatusChangeDate',
        headerName: 'Updated',
        width: 120,
        valueFormatter: (value) => new Date(value as string).toLocaleDateString(),
    }
];

export function ApplicantsGrid({ applicants, onApplicantSelect, loading = false }: ApplicantsGridProps) {
    return (
        <Box sx={{ height: '100%', width: '100%', bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
            <DataGrid
                rows={applicants}
                columns={columns}
                loading={loading}
                onRowClick={(params) => onApplicantSelect(params.row)}
                initialState={{
                    pagination: { paginationModel: { pageSize: 25 } },
                }}
                pageSizeOptions={[25, 50, 100]}
                disableRowSelectionOnClick
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #f1f5f9'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        bgcolor: 'background.default',
                        borderBottom: '1px solid #e2e8f0',
                    },
                }}
            />
        </Box>
    );
}
