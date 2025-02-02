export const checkAuthCookie = () => {
    const cookies = document.cookie.split('; ');
    console.log("All Cookies:", document.cookie);

    const authCookie = cookies.find(cookie => cookie.startsWith('auth_cookie='));

    console.log("Auth Cookie:", authCookie);

    // Redirect to '/user/login' if authCookie is not found
    if (!authCookie) {
        window.location.href = '/user/login';
    }
};
