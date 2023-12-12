import "./Navbar.css"
import UserButton from "./UserButton.jsx";
import TopicSwitcher from "./TopicSwitcher.jsx";

export default function Navbar() {
    return (
        <nav>
            <img src={"/opineoasis.svg"} alt={"Opine Oasis"} className={"nav-logo"} onClick={() => {location.href="/"}}/>
            <TopicSwitcher/>
            <UserButton/>
        </nav>
    );
}