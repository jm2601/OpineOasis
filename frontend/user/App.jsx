import './App.css'
import Post from "../components/Post.jsx";
import {useEffect, useState} from 'react';
import {getCommunity, pluralize} from "../components/utils.js";
import {Paper} from "@mui/material";

function getUser() {
    const split = location.href.split("/");
    const userTag = split.indexOf("user");
    const user = split[userTag + 1];
    return parseInt(user);
}

async function getCurrentUserId(state, setState) {
    try {
        const response = await fetch("/me");
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        state.currentUser = body.id;
        setState({ ...state });
    } catch (e) {
        // ignore
    }
}

function renderPosts(state) {
    return state.posts.map((post) => {
        const image = post.image ? `/file?id=` + post.image : undefined;
        const user = {
            id: post.user.id,
            username: post.user.name === null ? (post.user.username === null ? "Anonymous" : post.user.username) : post.user.name,
            avatar: post.user.avatar ? `/file?id=` + post.user.avatar : "/opineoasis2.svg"
        };
        const date = new Date(post.date);

        return (
            <Post key={post.id} currentUser={state.currentUser} vote={post.vote} community={post.community} id={post.id} votes={post.votes} comments={post.comments} date={date} user={user} title={post.title} text={post.text} img={image} />
        )
    });
}

async function getPosts(state, setState) {
    await getCurrentUserId(state, setState);

    const response = await fetch(`/api/user/${getUser()}`);
    const json = await response.json();

    state.user = json.user;
    state.posts = json.posts;
    setState({ ...state });
}

function App() {
    const [state, setState] = useState({
        posts: [],
        user: null,
        currentUser: null
    });

    useEffect(() => {
        getPosts(state, setState);
    }, []);

    return (
        <>
            {
                state.user && (
                    <Paper elevation={12} className={"user-container"}>
                        <img src={state.user.avatar ? `/file?id=${state.user.avatar}` : "/opineoasis2.svg"} alt="avatar" className="avatar" />
                        <div className={"info"}>
                            <h1>{state.user.name}</h1>
                            <h2>{state.user.username}</h2>
                            <p>{state.posts.length} {pluralize(state.posts.length, "post")}</p>
                        </div>
                    </Paper>
                )
            }
            {renderPosts(state)}
        </>
    );
}

export default App
