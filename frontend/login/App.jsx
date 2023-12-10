import './App.css'
import {Button, Checkbox, Collapse, FormControlLabel, Link, Paper, TextField} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import {useState} from "react";

function App() {
    const [state, setState] = useState({
        username: "",
        password: "",
        registrationOpen: false
    });

    const handleLogin = async () => {
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
                            margin={"normal"}/>
                        <TextField
                            id={"password"}
                            label={"Password"}
                            variant={"outlined"}
                            type={"password"}
                            fullWidth={true}
                            margin={"normal"}/>
                        <FormControlLabel control={<Checkbox defaultChecked />} label="Remember me" />
                        <LoadingButton variant={"contained"} fullWidth={true} loading={false} loadingPosition={"start"} style={{marginTop: "15px"}} onClick={handleLogin}>Login</LoadingButton>
                        <hr width={"100%"} style={{margin: "2em 0"}}/>
                        <Button onClick={() => setState({...state, registrationOpen: !state.registrationOpen})}>Don&apos;t have an account? Click here!</Button>
                    </Collapse>
                    <Collapse in={state.registrationOpen}>
                        <span>Welcome to the community! We're happy that you're here.</span>
                        <TextField
                            id={"registerUsername"}
                            label={"Username"}
                            variant={"outlined"}
                            type={"text"}
                            fullWidth={true}
                            margin={"normal"}/>
                        <TextField
                            id={"registerPassword"}
                            label={"Password"}
                            variant={"outlined"}
                            type={"password"}
                            fullWidth={true}
                            margin={"normal"}/>
                        <TextField
                            id={"registerPasswordConfirm"}
                            label={"Confirm Password"}
                            variant={"outlined"}
                            type={"password"}
                            fullWidth={true}
                            margin={"normal"}/>
                        <LoadingButton variant={"contained"} fullWidth={true} loading={false} loadingPosition={"start"} style={{marginTop: "15px"}}>Create account</LoadingButton>
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
