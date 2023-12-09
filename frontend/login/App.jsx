import './App.css'
import {Checkbox, FormControlLabel, Link, Paper, TextField} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';

function App() {
    return (
        <div className={"login-container"}>
            <Paper className={"login-paper"} elevation={16}>
                <div style={{flex: "1"}}>
                    <img src={"/opineoasis2.svg"} alt={"Opine Oasis"} className={"login-logo"} />
                    <span style={{textAlign: "center"}}><i>"Quench Your Curiosity, Dive into Opine Oasis!"</i></span>
                </div>
                <div style={{flex: "1"}}>
                    <h1 style={{textAlign: "center"}}>Welcome to the Opine Oasis!</h1>
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
                    <LoadingButton variant={"contained"} fullWidth={true} loading={false} loadingPosition={"start"}>Login</LoadingButton>
                    <hr width={"100%"}/>
                    <Link href={"/register"}>Don't have an account? Register here!</Link>
                </div>
            </Paper>
        </div>
    )
}

export default App
