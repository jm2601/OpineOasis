import './App.css'
import {useEffect, useState} from 'react';
import {Button, Paper, TextField} from "@mui/material";

async function getCurrentUser(state, setState) {
    try {
        const response = await fetch("/me");
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        state.id = body.id;
        state.name = body.name;
        state.username = body.username;
        state.avatar = body.avatar;

        setState({ ...state });
    } catch (e) {
        // ignore
    }
}

async function updateUserInfo(state, setState) {
    const formData = new FormData();
    formData.append("name", state.name);
    formData.append("avatar", state.avatar);

    const response = await fetch("/settings", {
        method: "PUT",
        body: formData
    });

    if (response.status !== 200) {
        const body = await response.json();
        alert(body.message);
    } else {
        location.href = "/";
    }
}

async function updatePassword(state, setState) {
    if (state.password !== state.confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (state.password.length < 4) {
        alert("Password must be at least 4 characters long!");
        return;
    }

    const formData = new FormData();
    formData.append("password", state.password);

    const response = await fetch("/settings/password", {
        method: "PUT",
        body: formData
    });

    if (response.status !== 200) {
        const body = await response.json();
        alert(body.message);
    } else {
        location.href = "/";
    }
}

function App() {
    const [state, setState] = useState({
        id: 0,
        name: "",
        username: "",
        password: "",
        confirmPassword: "",
        avatar: null,
        avatarPreview: null
    });

    useEffect(() => {
        getCurrentUser(state, setState);
    }, []);

    return (
        <Paper className="settings-container">
            <h1>Settings</h1>
            <p>Change your account settings here.</p>
            <p><i>Note: you cannot change your username.</i></p>
            <hr/>
            <div className="avatar-container">
                <label>
                    <img src={state.avatarPreview === null ? (state.avatar === null ? "/opineoasis2.svg" : `/file?id=${state.avatar}` ) : state.avatarPreview} alt={"Avatar"} />
                    <span>Click here to upload a profile picture</span>
                    <input hidden type={"file"} accept={"image/*"} onChange={(e) => {
                        const file = e.target.files[0];

                        if (file.size > 1024 * 1024 * 10) {
                            alert("File too large!");
                            return;
                        }

                        state.avatar = file;

                        if (FileReader) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                state.avatarPreview = e.target.result;
                                setState({ ...state });
                            }
                            reader.readAsDataURL(file);
                        }

                        setState({ ...state });
                    }} />
                </label>
            </div>
            <TextField
                label={"Username"}
                value={state.username}
                disabled
                fullWidth={true}
            />
            <TextField
                label={"Display Name"}
                value={state.name}
                onChange={(e) => {
                    state.name = e.target.value;
                    setState({ ...state });
                }}
                fullWidth={true}
            />
            <Button
                variant={"contained"}
                onClick={() => updateUserInfo(state, setState)}
                fullWidth={true}
            >
                Update profile picture and display name
            </Button>
            <hr/>
            <TextField
                label={"Password"}
                type={"password"}
                value={state.password}
                onChange={(e) => {
                    state.password = e.target.value;
                    setState({ ...state });
                }}
                fullWidth={true}
            />
            <TextField
                label={"Confirm Password"}
                type={"password"}
                value={state.confirmPassword}
                onChange={(e) => {
                    state.confirmPassword = e.target.value;
                    setState({ ...state });
                }}
            />
            <Button
                variant={"contained"}
                onClick={() => updatePassword(state, setState)}
            >
                Update password
            </Button>
        </Paper>
    )
}

export default App
