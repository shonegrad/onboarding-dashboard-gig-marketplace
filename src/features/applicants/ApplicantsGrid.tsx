import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel } from '@mui/x-data-grid';
import { Box, Typography, Avatar, Rating, IconButton, Tooltip, Chip } from '@mui/material';
import { ArrowForward, Block, Visibility } from '@mui/icons-material';
import { Applicant, OnboardingStatus } from '../../types';
import { StatusChip } from '../../components/common/StatusChip';
import { getNextStage } from '../../utils/statusUtils';

interface ApplicantsGridProps {
    applicants: Applicant[];
    onApplicantSelect: (applicant: Applicant) => void;
    onQuickAction?: (applicant: Applicant, action: 'advance' | 'decline') => void;
    loading?: boolean;
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
}

const getDaysAgo = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
};

export function ApplicantsGrid({
    applicants,
    onApplicantSelect,
    onQuickAction,
    loading = false,
    selectedIds = [],
    onSelectionChange
}: ApplicantsGridProps) {

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Applicant',
            flex: 2,
            minWidth: 220,
            renderCell: (params: GridRenderCellParams<Applicant>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
                    <Avatar
                        src={params.row.avatar}
                        alt={params.row.name}
                        sx={{ width: 36, height: 36 }}
                    >
                        {params.row.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                            {params.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {params.row.jobTitle}
                        </Typography>
                    </Box>
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
            flex: 1.2,
            minWidth: 140,
            renderCell: (params: GridRenderCellParams<Applicant>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
                    <Typography variant="body2" noWrap>
                        {params.row.location.city}
                    </Typography>
                    <Chip
                        label={params.row.location.country.slice(0, 2).toUpperCase()}
                        size="small"
                        sx={{ height: 18, fontSize: 10, fontWeight: 600 }}
                    />
                </Box>
            ),
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 130,
            renderCell: (params: GridRenderCellParams<Applicant>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Rating value={params.value} precision={0.5} size="small" readOnly max={5} />
                            <Typography variant="caption" color="text.secondary">
                                ({params.value.toFixed(1)})
                            </Typography>
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                </Box>
            ),
        },
        {
            field: 'appliedDate',
            headerName: 'Applied',
            width: 90,
            renderCell: (params: GridRenderCellParams<Applicant>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">
                        {getDaysAgo(params.value)}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'actions',
            headerName: '',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams<Applicant>) => {
                const nextStage = getNextStage(params.row.status);
                const canAdvance = nextStage && params.row.status !== 'Declined' && params.row.status !== 'Go Live';

                return (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        height: '100%',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '.MuiDataGrid-row:hover &': { opacity: 1 }
                    }}>
                        <Tooltip title="View Details">
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); onApplicantSelect(params.row); }}
                            >
                                <Visibility fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {canAdvance && onQuickAction && (
                            <Tooltip title={`Advance to ${nextStage}`}>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => { e.stopPropagation(); onQuickAction(params.row, 'advance'); }}
                                >
                                    <ArrowForward fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {params.row.status !== 'Declined' && params.row.status !== 'Go Live' && onQuickAction && (
                            <Tooltip title="Decline">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => { e.stopPropagation(); onQuickAction(params.row, 'decline'); }}
                                >
                                    <Block fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        }
    ];

    return (
        <Box sx={{ height: '100%', width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
            <DataGrid
                rows={applicants}
                columns={columns}
                loading={loading}
                onRowClick={(params) => onApplicantSelect(params.row)}
                rowSelectionModel={selectedIds}
                onRowSelectionModelChange={(newSelection: GridRowSelectionModel) =>
                    onSelectionChange?.(newSelection as string[])
                }
                checkboxSelection={!!onSelectionChange}
                initialState={{
                    pagination: { paginationModel: { pageSize: 25 } },
                    sorting: { sortModel: [{ field: 'appliedDate', sort: 'desc' }] }
                }}
                pageSizeOptions={[25, 50, 100]}
                disableRowSelectionOnClick
                rowHeight={60}
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                        borderBottom: 1,
                        borderColor: 'divider',
                        cursor: 'pointer'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        bgcolor: 'background.default',
                        borderBottom: 1,
                        borderColor: 'divider',
                    },
                    '& .MuiDataGrid-row:hover': {
                        bgcolor: 'action.hover',
                    },
                    '& .MuiDataGrid-row:nth-of-type(even)': {
                        bgcolor: 'action.hover',
                    },
                }}
            />
        </Box>
    );
}
