export const getThemeColors = (mode) => {
    const sameThemeColour = mode === 'light' ? 'white' : 'black';
    const oppositeThemeColour = mode === 'light' ? 'black' : 'white';
    return { sameThemeColour, oppositeThemeColour };
};