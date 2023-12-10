import "./Post.css"
import {Paper} from "@mui/material";
import {useState} from "react";

function dateToText(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = diff / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    if (days > 7) {
        return date.toLocaleString();
    }

    if (days > 1) {
        return `${Math.floor(days)} days ago`;
    }

    if (hours > 1) {
        return `${Math.floor(hours)} hours ago`;
    }

    if (minutes > 1) {
        return `${Math.floor(minutes)} minutes ago`;
    }

    if (seconds > 1) {
        return `${Math.floor(seconds)} seconds ago`;
    }
}

function ExpandableImage(props) {
    const [expanded, setExpanded] = useState(false);

    return (
        expanded ?
            <img className={"post-img-full"} src={props.img} alt={props.title} onClick={() => setExpanded(!expanded)}/> :
            <div className={"post-img"} style={{backgroundImage: `url(\"${props.img}\")`}} onClick={() => setExpanded(!expanded)}>

            </div>
    )

}

export default function Post(props) {
    if (props.post === null) {
        return null;
    }

    return (
        <Paper className="post" elevation={12}>
            <div className={"post-header"}>
                <img className={"post-user-avatar"} src={props.user.avatar} alt={props.user.username} />
                <div className={"post-user-info"}>
                    <span>{props.user.username} - {dateToText(props.date)}</span>
                </div>
            </div>
            <h1>{props.title}</h1>
            <p>{props.text}</p>
            {
                props.img !== null ? <ExpandableImage img={props.img} title={props.title} /> : null
            }
        </Paper>
    )
}