import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles';

export const ThemeContext = React.createContext();

export const ThemeContextProvider = ({ children }) => {
    // can set default theme as either 'dark' or 'light'
    const [mode, setMode] = React.useState('dark');

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode],
    );

    return (
        <ThemeContext.Provider value={{
            mode,
            toggleMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
        }}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    )
}

