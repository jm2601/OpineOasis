import "./Comment.css";
import {dateToText, downvote, pluralize, truncatePreviewText, upvote} from "./utils.js";
import {Button, IconButton, Paper} from "@mui/material";
import {useState, use} from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward.js";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward.js";

async function updateVote(state, setState) {
    const response = await fetch(`/api/community/${state.community}/post/${state.post}/comment/${state.id}/vote`, {
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

export default function Comment(props) {
    const [state, setState] = useState({
        id: props.id,
        post: props.post,
        community: props.community,
        user: props.user,
        text: props.text,
        date: props.date,
        vote: props.vote,
        votes: props.votes,
        replyTo: props.replyTo,
    });

    const handleUpvote = () => {
        upvote(state, setState);
        updateVote(state, setState);
    };

    const handleDownvote = () => {
        downvote(state, setState);
        updateVote(state, setState);
    };
    
    return (
        <Paper elevation={12} className={"comment"} style={window.top.location.hash.substring(1) === "" + state.id ? {border: "gold solid 5px"} : null}>
            <div className={"comment-split"}>
                <a name={`${state.id}`} className={"comment-anchor"}></a>
                <div className={"comment-votes"}>
                    <IconButton onClick={handleUpvote}><ArrowUpwardIcon className={"comment-vote-icon"}
                                                                        style={state.vote === 1 ? {color: "red"} : null}/></IconButton>
                    <span className={"comment-votes-count"}>{state.votes}</span>
                    <IconButton onClick={handleDownvote}><ArrowDownwardIcon className={"comment-vote-icon"}
                                                                            style={state.vote === -1 ? {color: "blue"} : null}/></IconButton>
                </div>
                <div className={"comment-content"}>
                    <div className={"comment-header"}>
                        <img className={"comment-user-avatar"} src={state.user.avatar} alt={state.user.username}/>
                        <div className={"comment-user-info"}>
                            <span>{state.user.username} - #{state.id} - {dateToText(state.date)} {state.replyTo ? <a href={`#${state.replyTo}`}>- Reply to #{state.replyTo}</a> : null}</span>
                        </div>
                    </div>
                    <p>{state.text}</p>
                    <div>
                        <Button variant={"text"} onClick={() => { if (props.onReply) props.onReply() }}>Reply</Button>
                    </div>
                </div>
            </div>
        </Paper>
    )
}