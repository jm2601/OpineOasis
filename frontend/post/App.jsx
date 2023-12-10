import './App.css'
import Post from "../components/Post.jsx";
import {Paper} from "@mui/material";
import {useState} from "react";
import Comment from "../components/Comment.jsx";

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
    return state.comments.map((comment) => {
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

function App() {
    const [state, setState] = useState({
        post: examplePost,
        comments: [exampleComment, {...exampleComment, id: 93, replyTo: 92}, {...exampleComment, id: 94, replyTo: 92}, {...exampleComment, id: 95, replyTo: 92}, {...exampleComment, id: 96, replyTo: 92}],
    })

    return (
        <div className={"post-container"}>
            <Post full vote={state.post.vote} community={state.post.community} id={state.post.id} votes={state.post.votes} comments={state.post.comments} date={state.post.date} user={state.post.user} title={state.post.title} text={state.post.text} img={state.post.img} />

            <Paper elevation={12} className={"post-comments"}>
                <h1>Post comments ({state.comments.length})</h1>
            </Paper>

            {generateComments(state)}
        </div>
    )
}

export default App
