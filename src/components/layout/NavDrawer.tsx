import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Divider,
} from '@mui/material';
import {
    People as PeopleIcon,
    BarChart as BarChartIcon,
    Map as MapIcon,
    RssFeed as FeedIcon,
    Settings as SettingsIcon,
    Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { APP_VERSION } from '../../version';
// const APP_VERSION = '0.3.0'; // Updated version for MUI rebuild

const drawerWidth = 240;

interface NavDrawerProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    mobileOpen: boolean;
    onDrawerToggle: () => void;
}

const navItems = [
    { id: 'applicants', label: 'Applicants', icon: <PeopleIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChartIcon /> },
    { id: 'map', label: 'Map Overview', icon: <MapIcon /> },
    { id: 'feed', label: 'Activity Feed', icon: <FeedIcon /> },
];

export function NavDrawer({ activeTab, onTabChange, mobileOpen, onDrawerToggle }: NavDrawerProps) {
    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <DashboardIcon color="primary" />
                <Typography variant="h6" color="text.primary" fontWeight="bold">
                    Dashboard
                </Typography>
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.id} disablePadding>
                        <ListItemButton
                            selected={activeTab === item.id}
                            onClick={() => {
                                onTabChange(item.id);
                                // Close drawer on mobile when item clicked
                                if (mobileOpen) onDrawerToggle();
                            }}
                            sx={{
                                mx: 1,
                                borderRadius: 1,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.contrastText',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.id ? 'inherit' : 'text.secondary' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
                <ListItemButton sx={{ borderRadius: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                </ListItemButton>
                <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                    v{APP_VERSION}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}
