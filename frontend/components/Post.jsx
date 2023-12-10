import "./Post.css"
import {IconButton, Paper} from "@mui/material";
import {useState} from "react";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function pluralize(number, word) {
    return number === 1 ? word : word + "s";
}

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
        return `${Math.floor(days)} ${pluralize(Math.floor(days), "day")} ago`;
    }

    if (hours > 1) {
        return `${Math.floor(hours)} ${pluralize(Math.floor(hours), "hour")} ago`;
    }

    if (minutes > 1) {
        return `${Math.floor(minutes)} ${pluralize(Math.floor(minutes), "minute")} ago`;
    }

    if (seconds > 1) {
        return `${Math.floor(seconds)} ${pluralize(Math.floor(seconds), "second")} ago`;
    }
}

function truncatePreviewText(text) {
    const max = 200;
    if (text.length > max) {
        return text.substring(0, max) + "... (click to read more)";
    }

    return text;
}

function ExpandableImage(props) {
    const [expanded, setExpanded] = useState(false);

    return (
        expanded ?
            <>
                <span className={"post-img-hint"}>Click image again to shrink</span>
                <img className={"post-img-full"} src={props.img} alt={props.title}
                     onClick={() => setExpanded(!expanded)}/>
            </> :
            <>
                <span className={"post-img-hint"}>Click image to expand</span>
                <div className={"post-img"} style={{backgroundImage: `url(\"${props.img}\")`}}
                     onClick={() => setExpanded(!expanded)}>
                </div>
            </>
    )

}

export default function Post(props) {
    if (props.post === null) {
        return null;
    }

    return (
        <Paper className="post" elevation={12}>
            <a href={`/communities/${props.community}/posts/${props.id}`} className={"post-link"}>
                <div className={"post-split"}>
                    <div className={"post-votes"}>
                        <IconButton><ArrowUpwardIcon className={"post-vote-icon"}/></IconButton>
                        <span className={"post-votes-count"}>{props.votes}</span>
                        <IconButton><ArrowDownwardIcon className={"post-vote-icon"}/></IconButton>
                    </div>
                    <div className={"post-content"}>
                        <div className={"post-header"}>
                            <img className={"post-user-avatar"} src={props.user.avatar} alt={props.user.username}/>
                            <div className={"post-user-info"}>
                                <span>{props.user.username} - {dateToText(props.date)}</span>
                            </div>
                        </div>
                        <h1>{props.title}</h1>
                        <p>{truncatePreviewText(props.text)}</p>
                        <p className={"post-comment-count"}>{props.comments} {pluralize(props.comments, "comment")}</p>
                    </div>
                </div>
            </a>

            {
                props.img !== null && props.img !== undefined ?
                    <ExpandableImage img={props.img} title={props.title}/> : null
            }
        </Paper>
    )
}