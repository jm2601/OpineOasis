import './App.css'
import Post from "../components/Post.jsx";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    TextField
} from "@mui/material";
import {useState} from "react";
import Comment from "../components/Comment.jsx";
import LoadingButton from "@mui/lab/LoadingButton";

const examplePost = {
    id: 4,
    community: 1,
    votes: 123,
    vote: 1,
    comments: 11,
    date: new Date(2023, 11, 9, 20, 0, 0),
    user: {username: "DoggySazHi", avatar: "https://avatars.githubusercontent.com/u/42221528"},
    title: "i'm going insanae",
    text: "testing long text Bacon ipsum dolor amet pancetta biltong pork loin tenderloin buffalo andouille kevin shank brisket pastrami strip steak. Brisket beef kevin porchetta drumstick. Venison bresaola meatloaf shoulder beef ribs. Cupim picanha hamburger doner cow boudin pig jowl frankfurter. Filet mignon kielbasa jerky corned beef. Beef ribs short loin salami spare ribs cupim tongue bresaola. Ham hock burgdoggen short ribs, sausage chicken pork loin doner hamburger pastrami andouille fatback prosciutto drumstick. Pork belly buffalo meatball ribeye meatloaf shoulder tenderloin. Brisket bacon prosciutto doner, ham hock spare ribs cow pork capicola tri-tip. Tri-tip turkey jerky tail kevin, pig corned beef meatloaf ribeye biltong frankfurter leberkas short ribs. Spare ribs cupim beef meatball jowl chuck swine porchetta ham hock short loin.",
    img: "https://cdn.donmai.us/original/07/00/__kochiya_sanae_touhou_and_2_more_drawn_by_yaise__07006b7b6025bac35e7e697b1f262a16.png"
};

const exampleComment = {
    id: 92,
    post: 4,
    user: {username: "DoggySazHi", avatar: "https://avatars.githubusercontent.com/u/42221528"},
    text: "i'm going insanae, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment, but at least this is a comment",
    date: new Date(2023, 11, 9, 23, 0, 0),
    vote: 1,
    votes: 123,
    replyTo: null,
}

function generateComments(state) {
    return state.comments.toSorted((a, b) => a.date - b.date).map((comment) => {
       return (
           <Comment
               id={comment.id}
               key={comment.id}
               post={comment.post}
               user={comment.user}
               text={comment.text}
               date={comment.date}
               vote={comment.vote}
               votes={comment.votes}
               replyTo={comment.replyTo} />
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

async function submitComment(state, setState) {
    try {
        setState({
            ...state,
            commentLoading: true,
        });

        const response = await fetch("/comment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                post: state.post.id,
                text: state.text,
            }),
        });

        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        setState({
            ...state,
            commentLoading: false,
            commentEditorOpen: false,
            text: "",
            comments: [...state.comments, body.comment],
        });
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
        post: examplePost,
        comments: [exampleComment, {...exampleComment, id: 93, replyTo: 92}, {...exampleComment, id: 94, replyTo: 92}, {...exampleComment, id: 95, replyTo: 92}, {...exampleComment, id: 96, replyTo: 92}],
        commentEditorOpen: false,
        text: "",
        commentLoading: false,
    });
    
    const handleClose = () => setState({...state, commentEditorOpen: false});

    return (
        <div className={"post-container"}>
            <Post full vote={state.post.vote} community={state.post.community} id={state.post.id} votes={state.post.votes} comments={state.post.comments} date={state.post.date} user={state.post.user} title={state.post.title} text={state.post.text} img={state.post.img} />

            <Paper elevation={12} className={"post-comments"}>
                <span className={"post-header"}>Post comments ({state.comments.length})</span>
                <Button variant={"contained"} onClick={() => handleComment(state, setState)}>Add comment</Button>
                <Dialog open={state.commentEditorOpen} onClose={handleClose}>
                    <DialogTitle>Create post</DialogTitle>
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

            {generateComments(state)}
        </div>
    )
}

export default App
