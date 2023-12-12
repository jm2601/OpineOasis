import "./Post.css"
import {dateToText, downvote, pluralize, truncatePreviewText, upvote} from "./utils.js";
import {
    Button,
    Dialog, DialogActions,
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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from "@mui/icons-material/Delete.js";
import ModeEditIcon from "@mui/icons-material/ModeEdit.js";
import LoadingButton from "@mui/lab/LoadingButton";

async function deletePost(state, setState) {
    const response = await fetch(`/api/community/${state.community}/post/${state.id}`, {
        method: "DELETE"
    });

    if (response.status !== 200) {
        console.error("Failed to delete post: " + await response.text());
        alert("Failed to delete post");
    } else {
        location.reload();
    }
}

async function editPost(state, setState) {
    const response = await fetch(`/api/community/${state.community}/post/${state.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: state.editText
        })
    });

    if (response.status !== 200) {
        console.error("Failed to edit post: " + await response.text());
        alert("Failed to edit post");
    } else {
        setState({...state, postEditorOpen: false, text: state.editText});
    }
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
        currentUser: props.currentUser,
        optionsAnchor: null,
        postEditorOpen: false,
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

    const content = (
        <>
            <h1>{state.title}</h1>
            <p>{props.full ? state.text : truncatePreviewText(state.text)}</p>
            <p className={"post-comment-count"}>{state.comments} {pluralize(state.comments, "comment")}</p>
        </>
    );

    const optionsDropdown = (
            state.user.id === state.currentUser ?
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
                        <MenuItem onClick={() => deletePost(state, setState)}><DeleteIcon /> Delete</MenuItem>
                        <MenuItem onClick={() => setState({...state, postEditorOpen: true, optionsAnchor: null})}><ModeEditIcon /> Edit</MenuItem>
                    </Menu>
                    <Dialog open={state.postEditorOpen} onClose={() => setState({...state, postEditorOpen: false})}>
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
                            <Button onClick={() => setState({...state, postEditorOpen: false})}>Cancel</Button>
                            <LoadingButton onClick={() => editPost(state, setState)} loading={state.editLoading}>Edit</LoadingButton>
                        </DialogActions>
                    </Dialog>
                </> : null
    )

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

                <div className={"post-content"}>
                    <div className={"post-header"}>
                        <img className={"post-user-avatar"} src={state.user.avatar} alt={state.user.username}/>
                        <div className={"post-user-info"}>
                            <span><a href={`/user/${state.user.id}`}>{state.user.username}</a> - {dateToText(state.date)} {optionsDropdown}</span>
                        </div>
                    </div>
                    {
                        props.full ? content :
                            <a href={`/community/${state.community}/post/${state.id}`} className={"post-link"}>
                                {content}
                            </a>
                    }
                </div>


            </div>

            {
                props.img !== null && props.img !== undefined ?
                    <ExpandableImage img={props.img} title={props.title}/> : null
            }
        </Paper>
    )
}