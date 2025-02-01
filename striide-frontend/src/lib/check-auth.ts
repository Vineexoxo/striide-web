export const checkAuthCookie = () => {
    const cookies = document.cookie.split('; ');
    const authCookie = cookies.find(cookie => cookie.startsWith('auth_cookie'));

    if (!authCookie) {
        window.location.href = '/user/login';
    }
};
