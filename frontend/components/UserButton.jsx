import {Button, Menu, MenuItem} from "@mui/material";
import {useEffect, useState} from "react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

async function checkLogin(state, setState) {
    try {
        const response = await fetch("/me");
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        setState({
            checkedLogin: true,
            username: body.username
        });
    } catch (e) {
        console.error("Failed to check login status: " + e);

        setState({
            checkedLogin: true,
            username: null
        });
    }
}

export default function UserButton() {
    const [state, setState] = useState({
        checkedLogin: false,
        username: null
    });

    useEffect(() => {
        checkLogin(state, setState);
    }, []);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        !state.checkedLogin ? null : (
            <div>
                <Button
                    id="basic-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    Welcome, {state.username === null ? "guest" : state.username}! ▼
                </Button>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {
                        state.username !== null ? (
                            [
                                <MenuItem key={"account"} onClick={() => {location.href = `/users/${state.username}`}}><AccountCircleIcon style={{paddingRight: "5px"}}/> My Profile</MenuItem>,
                                <MenuItem key={"settings"} onClick={() => {location.href = `/settings`}}><SettingsIcon style={{paddingRight: "5px"}}/> Settings</MenuItem>,
                                <MenuItem key={"logout"} onClick={() => {location.href = `/logout`}}><LogoutIcon style={{paddingRight: "5px"}}/> Logout</MenuItem>
                            ]
                        ) : (
                            [
                                <MenuItem key={"login"} onClick={() => {location.href = `/login`}}><LoginIcon style={{paddingRight: "5px"}}/> Login</MenuItem>,
                                <MenuItem key={"register"} onClick={() => {location.href = `/register`}}><AppRegistrationIcon style={{paddingRight: "5px"}}/> Register</MenuItem>,
                            ]
                        )
                    }
                </Menu>
            </div>
        )
    )
}