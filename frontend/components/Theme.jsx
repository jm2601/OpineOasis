import "./theme.css";
import {createTheme} from "@mui/material";

const Theme = createTheme({
    typography: {
        fontFamily: [
            "Noto Sans",
            "sans-serif"
        ].join(','),
    },
});

export default Theme;