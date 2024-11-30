import { createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        mode: 'dark', // Use 'dark' mode to match your dark background
        primary: {
            main: '#1D4ED8', // Customize with your primary color
        },
        secondary: {
            main: '#EEEEEE', // Customize with your secondary color
        },
        background: {
            default: '#111827', // Set default background color
            paper: '#1F2937',   // Set paper background color
        },
        text: {
            primary: '#FFFFFF', // Set primary text color
            secondary: '#9CA3AF', // Set secondary text color
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif', // Customize font family
    },
});

export default theme;