import "./Post.css"
import {dateToText, downvote, pluralize, truncatePreviewText, upvote} from "./utils.js";
import {IconButton, Paper} from "@mui/material";
import {useState} from "react";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

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

async function updateVote(state, setState) {
    const response = await fetch(`/api/community/${state.community}/post/${state.id}/vote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            vote: state.vote
        })
    });

    if (response.status !== 200) {
        console.error("Failed to update vote: " + await response.text());
        // Probably not logged in; redirect!
        location.href = "/login";
    }
}

export default function Post(props) {
    const [state, setState] = useState({
        id: props.id,
        community: props.community,
        votes: props.votes,
        vote: props.vote,
        comments: props.comments,
        date: props.date,
        user: props.user,
        title: props.title,
        text: props.text,
        img: props.img,
    });

    const handleUpvote = () => {
        upvote(state, setState);
        updateVote(state, setState);
    };
    const handleDownvote = () => {
        downvote(state, setState);
        updateVote(state, setState);
    };

    const content = (
        <div className={"post-content"}>
            <div className={"post-header"}>
                <img className={"post-user-avatar"} src={state.user.avatar} alt={state.user.username}/>
                <div className={"post-user-info"}>
                    <span>{state.user.username} - {dateToText(state.date)}</span>
                </div>
            </div>
            <h1>{state.title}</h1>
            <p>{props.full ? state.text : truncatePreviewText(state.text)}</p>
            <p className={"post-comment-count"}>{state.comments} {pluralize(state.comments, "comment")}</p>
        </div>
    );

    return (
        <Paper className="post" elevation={12}>
            <div className={"post-split"}>
                <div className={"post-votes"}>
                    <IconButton onClick={handleUpvote}><ArrowUpwardIcon className={"post-vote-icon"}
                                                                        style={state.vote === 1 ? {color: "red"} : null}/></IconButton>
                    <span className={"post-votes-count"}>{state.votes}</span>
                    <IconButton onClick={handleDownvote}><ArrowDownwardIcon className={"post-vote-icon"}
                                                                            style={state.vote === -1 ? {color: "blue"} : null}/></IconButton>
                </div>
                {
                    props.full ? content :
                        <a href={`/community/${state.community}/post/${state.id}`} className={"post-link"}>
                            {content}
                        </a>
                }
            </div>

            {
                props.img !== null && props.img !== undefined ?
                    <ExpandableImage img={props.img} title={props.title}/> : null
            }
        </Paper>
    )
}