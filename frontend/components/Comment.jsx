import "./Comment.css";
import {dateToText, downvote, pluralize, truncatePreviewText, upvote} from "./utils.js";
import {
    Button, Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    TextField
} from "@mui/material";
import {useState} from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward.js";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward.js";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from "@mui/lab/LoadingButton";
import ModeEditIcon from '@mui/icons-material/ModeEdit';

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

async function editComment(state, setState) {
    const response = await fetch(`/api/community/${state.community}/post/${state.post}/comment/${state.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: state.editText
        })
    });

    if (response.status !== 200) {
        console.error("Failed to edit comment: " + await response.text());
        alert("Failed to edit comment");
    } else {
        setState({...state, commentEditorOpen: false, text: state.editText});
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
        currentUser: props.currentUser,
        optionsAnchor: null,
        commentEditorOpen: false,
        editText: props.text,
        editLoading: false
    });

    const handleUpvote = () => {
        upvote(state, setState);
        updateVote(state, setState);
    };

    const handleDownvote = () => {
        downvote(state, setState);
        updateVote(state, setState);
    };

    const handleDelete = async () => {
        const response = await fetch(`/api/community/${state.community}/post/${state.post}/comment/${state.id}`, {
            method: "DELETE"
        });

        if (response.status !== 200) {
            console.error("Failed to delete comment: " + await response.text());
            alert("Failed to delete comment")
        } else {
            location.reload(); // lazy
        }
    }

    const menuComponent = state.user.id === state.currentUser ?
        (
            <>
                <IconButton size={"small"} onClick={(e) => setState({...state, optionsAnchor: e.currentTarget})}><MoreHorizIcon /></IconButton>
                <Menu
                    id="basic-menu"
                    anchorEl={state.optionsAnchor}
                    open={Boolean(state.optionsAnchor)}
                    onClose={() => setState({...state, optionsAnchor: null})}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem onClick={handleDelete}><DeleteIcon /> Delete</MenuItem>
                    <MenuItem onClick={() => setState({...state, commentEditorOpen: true, optionsAnchor: null})}><ModeEditIcon /> Edit</MenuItem>
                </Menu>
                <Dialog open={state.commentEditorOpen} onClose={() => setState({...state, commentEditorOpen: false})}>
                    <DialogTitle>Edit comment</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Updating your comment for this post.
                        </DialogContentText>
                        <TextField
                            margin="dense"
                            id="name"
                            label="Text"
                            type="text"
                            fullWidth
                            variant="standard"
                            multiline
                            rows={4}
                            onChange={(e) => setState({...state, editText: e.target.value})}
                            value={state.editText}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setState({...state, commentEditorOpen: false})}>Cancel</Button>
                        <LoadingButton onClick={() => editComment(state, setState)} loading={state.editLoading}>Edit</LoadingButton>
                    </DialogActions>
                </Dialog>
            </>
        ) : null;
    
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
                            <span>{state.user.username} - #{state.id} - {dateToText(state.date)} {state.replyTo ? <a href={`#${state.replyTo}`}>- Reply to #{state.replyTo}</a> : null} { menuComponent }</span>
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