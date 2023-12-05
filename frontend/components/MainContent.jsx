import "./MainContent.css";
import Navbar from "./Navbar.jsx";

export default function MainContent({children}) {
    return (
        <>
            <Navbar />
            <main className={"content"}>
                { children }
            </main>
        </>
    );
}