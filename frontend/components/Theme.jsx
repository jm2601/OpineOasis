import "./theme.css";
import {createTheme} from "@mui/material";

const Theme = createTheme({
    typography: {
        fontFamily: [
            "Varela Round",
            "sans-serif"
        ].join(','),
        button: {
            textTransform: 'none'
        }
    },
});

export default Theme;