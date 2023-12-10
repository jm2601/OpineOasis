import './App.css'
import {Button, Checkbox, Collapse, FormControlLabel, Link, Paper, TextField} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import {useState} from "react";

function App() {
    const [state, setState] = useState({
        username: "",
        password: "",
        passwordConfirm: "",
        registrationOpen: false,
        loading: false,
        error: ""
    });

    const handleLogin = async () => {
        setState({
            ...state,
            error: "",
            loading: true
        });

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: state.username,
                    password: state.password
                })
            });

            if (response.status === 200) {
                window.location.href = "/";
            }

            const body = await response.json();
            throw Error(body.message);
        } catch (e) {
            console.error("Failed to login: " + e);
            setState({
                ...state,
                error: "Failed to login: " + e,
                loading: false
            });
        }
    };

    const handleRegister = async () => {
        if (state.password !== state.passwordConfirm) {
            setState({
                ...state,
                error: "Passwords do not match",
                loading: false
            });
            return;
        } else if (state.username.length < 2) {
            setState({
                ...state,
                error: "Username must be at least 2 characters",
                loading: false
            });
            return;
        } else if (state.password.length < 4) {
            setState({
                ...state,
                error: "Password must be at least 4 characters",
                loading: false
            });
            return;
        }

        setState({
            ...state,
            error: "",
            loading: true
        });

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: state.username,
                    password: state.password
                })
            });

            if (response.status === 200) {
                window.location.href = "/";
            }

            const body = await response.json();
            throw Error(body.message);
        } catch (e) {
            console.error("Failed to register: " + e);
            setState({
                ...state,
                error: "Failed to register: " + e,
                loading: false
            });
        }
    };

    return (
        <div className={"login-container"}>
            <Paper className={"login-paper"} elevation={16}>
                <div style={{flex: "1"}}>
                    <img src={"/opineoasis2.svg"} alt={"Opine Oasis"} className={"login-logo"} />
                    <span style={{textAlign: "center"}}><i>&quot;Quench Your Curiosity, Dive into Opine Oasis!&quot;</i></span>
                </div>
                <div style={{flex: "1"}}>
                    <h1 style={{textAlign: "center"}}>Opine Oasis</h1>
                    <Collapse in={!state.registrationOpen}>
                        <span>Welcome back! Log in here.</span>
                        <TextField
                            id={"username"}
                            label={"Username"}
                            variant={"outlined"}
                            type={"text"}
                            fullWidth={true}
                            margin={"normal"}
                            onChange={(e) => setState({...state, username: e.target.value})}
                            value={state.username}
                        />
                        <TextField
                            id={"password"}
                            label={"Password"}
                            variant={"outlined"}
                            type={"password"}
                            fullWidth={true}
                            margin={"normal"}
                            onChange={(e) => setState({...state, password: e.target.value})}
                            value={state.password}
                        />
                        <FormControlLabel control={<Checkbox defaultChecked/>} label="Remember me"/>
                        <div style={{color: "red"}}>{state.error}</div>
                        <LoadingButton variant={"contained"} fullWidth={true} loading={false}
                                       style={{marginTop: "15px"}} onClick={handleLogin}>Login</LoadingButton>
                        <hr width={"100%"} style={{margin: "2em 0"}}/>
                        <Button
                            onClick={() => setState({...state, registrationOpen: !state.registrationOpen})}>Don&apos;t
                            have an account? Click here!</Button>
                    </Collapse>
                    <Collapse in={state.registrationOpen}>
                        <span>Welcome to the community! We're happy that you're here.</span>
                        <TextField
                            id={"registerUsername"}
                            label={"Username"}
                            variant={"outlined"}
                            type={"text"}
                            fullWidth={true}
                            margin={"normal"}
                            onChange={(e) => setState({...state, username: e.target.value})}
                            value={state.username}
                        />
                        <TextField
                            id={"registerPassword"}
                            label={"Password"}
                            variant={"outlined"}
                            type={"password"}
                            fullWidth={true}
                            margin={"normal"}
                            onChange={(e) => setState({...state, password: e.target.value})}
                            value={state.password}
                        />
                        <TextField
                            id={"registerPasswordConfirm"}
                            label={"Confirm Password"}
                            variant={"outlined"}
                            type={"password"}
                            fullWidth={true}
                            margin={"normal"}
                            onChange={(e) => setState({...state, passwordConfirm: e.target.value})}
                            value={state.passwordConfirm}
                        />
                        <div style={{color: "red"}}>{state.error}</div>
                        <LoadingButton variant={"contained"} fullWidth={true} loading={state.loading} style={{marginTop: "15px"}} onClick={handleRegister}>Create account</LoadingButton>
                        <hr width={"100%"} style={{margin: "2em 0"}}/>
                        <Button
                            onClick={() => setState({...state, registrationOpen: !state.registrationOpen})}>Already have an account? Click here!</Button>
                    </Collapse>
                </div>
            </Paper>
        </div>
    )
}

export default App
