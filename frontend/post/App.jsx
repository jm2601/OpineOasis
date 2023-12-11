import './App.css'
import Post from "../components/Post.jsx";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Link,
    Paper,
    TextField
} from "@mui/material";
import {useEffect, useState} from "react";
import Comment from "../components/Comment.jsx";
import LoadingButton from "@mui/lab/LoadingButton";
import {getCommunity, getPost} from "../components/utils.js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function generateComments(state, setState) {
    return state.comments.toSorted((a, b) => a.date - b.date).map((comment) => {
       return (
           <Comment
               id={comment.id}
               key={comment.id}
               post={state.post.id}
               community={state.post.community}
               user={comment.user}
               text={comment.text}
               date={new Date(comment.date)}
               vote={comment.vote}
               votes={comment.votes}
               replyTo={comment.replyTo}
               onReply={() => setState({...state, commentEditorOpen: true, replyTo: comment.id})}
           />
       )
    });
}

async function handleComment(state, setState) {
    try {
        const response = await fetch("/me");
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }
    } catch (e) {
        console.error("Failed to get user; probably not logged in: " + e);
        location.href = "/login";
        return;
    }

    setState({
        ...state,
        commentEditorOpen: true,
    });
}

async function fetchPost(state, setState) {
    try {
        const community = getCommunity();
        const post = getPost();

        const response = await fetch(`/api/community/${community}/post/${post}`);
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        setState({
            ...state,
            post: {
                ...body.post,
                "img": body.post.image ? `/file?id=` + body.post.image : undefined,
                "community": community,
                "user": {
                    username: body.post.user.name === null ? (body.post.user.username === null ? "Anonymous" : body.post.user.username) : body.post.user.name,
                    avatar: body.post.user.avatar ? `/file?id=` + body.post.user.avatar : "/opineoasis2.svg"
                },
                "date": new Date(body.post.date),
            },
            comments: body.comments.map((comment) => {
                return {
                    ...comment,
                    user: {
                        "username": comment.user.name === null ? (comment.user.username === null ? "Anonymous" : comment.user.username) : comment.user.name,
                        "avatar": comment.user.avatar ? `/file?id=` + comment.user.avatar : "/opineoasis2.svg"
                    },
                }
            }),
        });
    } catch (e) {
        console.error("Failed to get post: " + e);
    }
}

async function submitComment(state, setState) {
    try {
        setState({
            ...state,
            commentLoading: true,
        });

        const response = await fetch(`/api/community/${state.post.community}/post/${state.post.id}/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: state.text,
                replyTo: state.replyTo,
            }),
        });

        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        state.commentLoading = false;
        state.commentEditorOpen = false;
        state.text = "";
        state.replyTo = null;

        setState({ ...state });
        await fetchPost(state, setState);
    } catch (e) {
        console.error("Failed to submit comment: " + e);

        alert("Failed to submit comment: " + e);

        setState({
            ...state,
            commentLoading: false,
        });
    }
}

function App() {
    const [state, setState] = useState({
        post: null,
        comments: [],
        commentEditorOpen: false,
        text: "",
        commentLoading: false,
        replyTo: null,
    });
    
    const handleClose = () => setState({...state, commentEditorOpen: false});

    useEffect(() => {
        fetchPost(state, setState);
    }, []);

    return (
        <div className={"post-container"}>
            {
                state.post === null ? (
                    <Paper elevation={12} className={"post-comments"}>
                        <span>Loading... If nothing shows up here, this page probably doesn't exist...</span>
                    </Paper>
                ) : (
                    <>
                        <Paper elevation={12} className={"post-comments"}>
                            <Link href={`/community/${state.post.community}`} sx={{display: "flex", alignItems: "center"}}>
                                <ArrowBackIcon/>
                                Go back to the community
                            </Link>
                        </Paper>

                        <Post full vote={state.post.vote} community={state.post.community} id={state.post.id} votes={state.post.votes} comments={state.post.comments} date={state.post.date} user={state.post.user} title={state.post.title} text={state.post.text} img={state.post.img} />

                        <Paper elevation={12} className={"post-comments"}>
                            <span className={"post-header"}>Post comments ({state.comments.length})</span>
                            <Button variant={"contained"} onClick={() => handleComment(state, setState)}>Add comment</Button>
                            <Dialog open={state.commentEditorOpen} onClose={handleClose}>
                                <DialogTitle>Create comment</DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        Create a comment for this post. Please have fun and be nice! Or don't, I'm not your mom.
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
                                        onChange={(e) => setState({...state, text: e.target.value})}
                                        value={state.text}
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleClose}>Cancel</Button>
                                    <LoadingButton onClick={() => submitComment(state, setState)} loading={state.commentLoading}>Post</LoadingButton>
                                </DialogActions>
                            </Dialog>
                        </Paper>
                    </>
                )
            }

            {generateComments(state, setState)}
        </div>
    )
}

export default App
