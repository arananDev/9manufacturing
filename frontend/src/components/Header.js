import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useNavigate } from 'react-router-dom';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import EventIcon from '@mui/icons-material/Event';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import CallMissedOutgoingIcon from '@mui/icons-material/CallMissedOutgoing';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';

const drawerWidth = 240;



const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


function Header() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate()

    let menuItems = []
    const username = localStorage.getItem('user')
    
    if (username !== null){
      switch (username){
        case 'purchasing':
          menuItems =  [
            {
              text: 'Demand Calendar',
              icon: EventIcon,
              onClick: () => navigate("/"),
            },
            {
              text: 'Purchase Forecast',
              icon: ScheduleSendIcon,
              onClick: () => navigate('/purchaseDemand'),
            },
            {
              text: 'Purchase Order Processing',
              icon: AddShoppingCartIcon,
              onClick: () => navigate('/purchaseOrderList'),
            },
            {
              text: 'Stock Database',
              icon: InventoryIcon,
              onClick: () => navigate('/stockDatabase'),
            },
            {
              text: 'Outstanding Purchase Orders',
              icon: DisabledByDefaultIcon,
              onClick: () => navigate('/PurchaseOrdersOutstanding'),
            },
            {
              text: 'Logout',
              icon: LogoutIcon,
              onClick: () => {
                localStorage.removeItem('user')
                navigate('/userLogin')
              }
            }
          ];
          break
          case 'purchasing2':
            menuItems =  [
              {
                text: 'Demand Calendar',
                icon: EventIcon,
                onClick: () => navigate("/"),
              },
              {
                text: 'Purchase Order Processing',
                icon: AddShoppingCartIcon,
                onClick: () => navigate('/purchaseOrderList'),
              },
              {
                text: 'Logout',
                icon: LogoutIcon,
                onClick: () => {
                  localStorage.removeItem('user')
                  navigate('/userLogin')
                }
              }
            ];
            break
          case 'hari':
            menuItems =  [
              {
                text: 'Stock Evaluation',
                icon: EventIcon,
                onClick: () => navigate("/finance/stockEvaluation"),
              },
              {
                text: 'Logout',
                icon: LogoutIcon,
                onClick: () => {
                  localStorage.removeItem('user')
                  navigate('/userLogin')
                }
              }
            ];
            break
      case 'warehousing':
        menuItems = [
            {
              text: 'Goods Recieved',
              icon: AllInboxIcon,
              onClick: () => navigate('/warehousing/goodsRecieved'),
              
            },
            {
              text: 'Goods Out',
              icon: CallMissedOutgoingIcon,
              onClick: () => navigate('/warehousing/goodsOut'),
              
            },
            {
              text: 'Get Daily Production',
              icon: AssignmentReturnedIcon,
              onClick: () => navigate('/warehousing/dailyProduction'),
              
            },
            {
              text: 'Logout',
              icon: LogoutIcon,
              onClick: () => {
                localStorage.removeItem('user')
                navigate('/userLogin')
              }
            },

          ]; 
          
          break
        default: 
          menuItems = []

      }


    }
    
      
    
    

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
  };
    return (
        <Box sx = {{display: 'flex'}}>
            <CssBaseline />
            <AppBar style = {{background: '#010426'}} position = "fixed" open = {open} >
                <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={{ mr: 2, ...(open && { display: 'none' }) }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            9Manufacturing
                        </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                    {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                  {menuItems.map(({ text, icon: Icon, onClick}, index) => (
                    <ListItem button key={text} onClick={onClick}>
                      <ListItemIcon>
                        <Icon />
                      </ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItem>
                  ))}
                </List>
                
            </Drawer>
      </Box>
    )
}

export default Header
