import ReactGA from "react-ga";

const prod = process.env.NODE_ENV === "production";

export const initGA = () => {
    if (prod) {
        ReactGA.initialize("UA-21029575-18");
    }
};

export const logPageView = () => {
    if (prod) {
        ReactGA.set({ page: window.location.pathname });
        ReactGA.pageview(window.location.pathname);
    }
};
